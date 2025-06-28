export type Web3Obgc = {
  "version": "0.1.0",
  "name": "clicker",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createUser",
      "accounts": [
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "submitClicks",
      "accounts": [
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "count",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalClicks",
            "type": "u64"
          },
          {
            "name": "totalUsers",
            "type": "u64"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "userClicks",
            "type": "u64"
          },
          {
            "name": "lastClickTimestamp",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidClickCount",
      "msg": "Invalid click count"
    },
    {
      "code": 6001,
      "name": "TooManyClicks",
      "msg": "Too many clicks in batch"
    },
    {
      "code": 6002,
      "name": "RateLimited",
      "msg": "Rate limited - too many clicks too quickly"
    },
    {
      "code": 6003,
      "name": "Overflow",
      "msg": "Arithmetic overflow"
    }
  ]
};

export const IDL: Web3Obgc = {
  "version": "0.1.0",
  "name": "clicker",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createUser",
      "accounts": [
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "submitClicks",
      "accounts": [
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "count",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalClicks",
            "type": "u64"
          },
          {
            "name": "totalUsers",
            "type": "u64"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "userClicks",
            "type": "u64"
          },
          {
            "name": "lastClickTimestamp",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidClickCount",
      "msg": "Invalid click count"
    },
    {
      "code": 6001,
      "name": "TooManyClicks",
      "msg": "Too many clicks in batch"
    },
    {
      "code": 6002,
      "name": "RateLimited",
      "msg": "Rate limited - too many clicks too quickly"
    },
    {
      "code": 6003,
      "name": "Overflow",
      "msg": "Arithmetic overflow"
    }
  ]
};