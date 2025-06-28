use anchor_lang::prelude::*;

declare_id!("Gbfg24vZ7pfr9zZAixC4aXxt6JB5X1zYwSpQXBAvYL4t");

#[program]
pub mod clicker {
    use super::*;

    /// Initialize the global state account
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let global_state = &mut ctx.accounts.global_state;
        global_state.total_clicks = 0;
        global_state.total_users = 0;
        global_state.authority = ctx.accounts.authority.key();
        global_state.bump = ctx.bumps.global_state;
        
        msg!("Global state initialized with authority: {}", global_state.authority);
        Ok(())
    }

    /// Create a new user state account
    pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
        let user_state = &mut ctx.accounts.user_state;
        let global_state = &mut ctx.accounts.global_state;
        
        user_state.user = ctx.accounts.user.key();
        user_state.user_clicks = 0;
        user_state.last_click_timestamp = Clock::get()?.unix_timestamp;
        user_state.bump = ctx.bumps.user_state;
        
        // Atomically increment total users
        global_state.total_users = global_state.total_users.checked_add(1)
            .ok_or(ErrorCode::Overflow)?;
        
        msg!("User state created for: {}", user_state.user);
        msg!("Total users now: {}", global_state.total_users);
        Ok(())
    }

    /// Submit a batch of clicks
    pub fn submit_clicks(ctx: Context<SubmitClicks>, count: u64) -> Result<()> {
        require!(count > 0, ErrorCode::InvalidClickCount);
        require!(count <= 10000, ErrorCode::TooManyClicks); // Reasonable batch limit
        
        let user_state = &mut ctx.accounts.user_state;
        let global_state = &mut ctx.accounts.global_state;
        let current_timestamp = Clock::get()?.unix_timestamp;
        
        // Rate limiting: prevent spam (max 1000 clicks per minute)
        let time_diff = current_timestamp - user_state.last_click_timestamp;
        if time_diff < 60 && user_state.user_clicks > 0 {
            let max_clicks_per_minute = 1000;
            require!(count <= max_clicks_per_minute, ErrorCode::RateLimited);
        }
        
        // Atomically update user clicks
        user_state.user_clicks = user_state.user_clicks.checked_add(count)
            .ok_or(ErrorCode::Overflow)?;
        user_state.last_click_timestamp = current_timestamp;
        
        // Atomically update global clicks
        global_state.total_clicks = global_state.total_clicks.checked_add(count)
            .ok_or(ErrorCode::Overflow)?;
        
        msg!("User {} submitted {} clicks", user_state.user, count);
        msg!("User total: {}, Global total: {}", user_state.user_clicks, global_state.total_clicks);
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = GlobalState::LEN,
        seeds = [b"global_state"],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(
        init,
        payer = user,
        space = UserState::LEN,
        seeds = [b"user_state", user.key().as_ref()],
        bump
    )]
    pub user_state: Account<'info, UserState>,
    
    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitClicks<'info> {
    #[account(
        mut,
        seeds = [b"user_state", user.key().as_ref()],
        bump = user_state.bump,
        has_one = user
    )]
    pub user_state: Account<'info, UserState>,
    
    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,
    
    pub user: Signer<'info>,
}

#[account]
pub struct GlobalState {
    pub total_clicks: u64,
    pub total_users: u64,
    pub authority: Pubkey,
    pub bump: u8,
}

impl GlobalState {
    pub const LEN: usize = 8 + // discriminator
        8 + // total_clicks
        8 + // total_users
        32 + // authority
        1; // bump
}

#[account]
pub struct UserState {
    pub user: Pubkey,
    pub user_clicks: u64,
    pub last_click_timestamp: i64,
    pub bump: u8,
}

impl UserState {
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        8 + // user_clicks
        8 + // last_click_timestamp
        1; // bump
}

#[error_code]
pub enum ErrorCode {
    #[msg("Invalid click count")]
    InvalidClickCount,
    #[msg("Too many clicks in batch")]
    TooManyClicks,
    #[msg("Rate limited - too many clicks too quickly")]
    RateLimited,
    #[msg("Arithmetic overflow")]
    Overflow,
}