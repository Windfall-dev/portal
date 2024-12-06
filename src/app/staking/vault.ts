/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/vault.json`.
 */
export type Vault = {
  address: "";
  metadata: {
    name: "vault";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "acceptVaultTypeAuthority";
      discriminator: [60, 36, 224, 175, 94, 84, 235, 218];
      accounts: [
        {
          name: "vaultType";
          writable: true;
        },
        {
          name: "newAuthority";
          signer: true;
        },
      ];
      args: [];
    },
    {
      name: "activate";
      discriminator: [194, 203, 35, 100, 151, 55, 170, 82];
      accounts: [
        {
          name: "vault";
          writable: true;
        },
        {
          name: "vaultType";
          relations: ["vault"];
        },
        {
          name: "userAuthority";
          signer: true;
          relations: ["vault"];
        },
      ];
      args: [];
    },
    {
      name: "closeVault";
      discriminator: [141, 103, 17, 126, 72, 75, 29, 29];
      accounts: [
        {
          name: "vault";
          writable: true;
        },
        {
          name: "vaultType";
          relations: ["vault"];
        },
        {
          name: "userAuthority";
          signer: true;
          relations: ["vault"];
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
      ];
      args: [];
    },
    {
      name: "closeVaultType";
      discriminator: [214, 7, 188, 145, 85, 167, 48, 233];
      accounts: [
        {
          name: "vaultType";
          writable: true;
        },
        {
          name: "authority";
          signer: true;
          relations: ["vaultType"];
        },
        {
          name: "pool";
          writable: true;
          relations: ["vaultType"];
        },
        {
          name: "reserve";
          writable: true;
          relations: ["vaultType"];
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "tokenProgram";
          relations: ["vaultType"];
        },
      ];
      args: [];
    },
    {
      name: "deactivate";
      discriminator: [44, 112, 33, 172, 113, 28, 142, 13];
      accounts: [
        {
          name: "vault";
          writable: true;
        },
        {
          name: "vaultType";
          relations: ["vault"];
        },
        {
          name: "userAuthority";
          signer: true;
          relations: ["vault"];
        },
      ];
      args: [];
    },
    {
      name: "deposit";
      discriminator: [242, 35, 198, 137, 82, 225, 242, 182];
      accounts: [
        {
          name: "vault";
          writable: true;
        },
        {
          name: "vaultType";
          writable: true;
          relations: ["vault"];
        },
        {
          name: "userAuthority";
          signer: true;
          relations: ["vault"];
        },
        {
          name: "mint";
          relations: ["vaultType"];
        },
        {
          name: "pool";
          writable: true;
          relations: ["vaultType"];
        },
        {
          name: "from";
          writable: true;
        },
        {
          name: "tokenProgram";
          relations: ["vaultType"];
        },
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
      ];
    },
    {
      name: "lockVaultType";
      discriminator: [32, 245, 195, 5, 217, 65, 165, 36];
      accounts: [
        {
          name: "vaultType";
          writable: true;
        },
        {
          name: "authority";
          signer: true;
          relations: ["vaultType"];
        },
      ];
      args: [
        {
          name: "isLocked";
          type: "bool";
        },
      ];
    },
    {
      name: "newVault";
      discriminator: [0, 196, 119, 39, 154, 60, 10, 44];
      accounts: [
        {
          name: "vault";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 97, 117, 108, 116];
              },
              {
                kind: "account";
                path: "vaultType";
              },
              {
                kind: "account";
                path: "userAuthority";
              },
            ];
          };
        },
        {
          name: "vaultType";
        },
        {
          name: "userAuthority";
          signer: true;
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
      ];
      args: [];
    },
    {
      name: "newVaultType";
      discriminator: [115, 230, 146, 235, 63, 19, 186, 29];
      accounts: [
        {
          name: "vaultType";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [118, 97, 117, 108, 116, 95, 116, 121, 112, 101];
              },
              {
                kind: "account";
                path: "mint";
              },
              {
                kind: "account";
                path: "authority";
              },
            ];
          };
        },
        {
          name: "authority";
          signer: true;
        },
        {
          name: "mint";
        },
        {
          name: "pool";
        },
        {
          name: "reserve";
        },
        {
          name: "payer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        },
        {
          name: "tokenProgram";
        },
      ];
      args: [
        {
          name: "seasonStart";
          type: "i64";
        },
        {
          name: "seasonDuration";
          type: "i64";
        },
        {
          name: "deactivationLockWindow";
          type: "i64";
        },
        {
          name: "cooldownWindow";
          type: "i64";
        },
        {
          name: "maxDepositPerUser";
          type: "u64";
        },
        {
          name: "instantDeactivation";
          type: "bool";
        },
      ];
    },
    {
      name: "nominateVaultTypeAuthority";
      discriminator: [217, 203, 70, 4, 242, 147, 61, 120];
      accounts: [
        {
          name: "vaultType";
          writable: true;
        },
        {
          name: "authority";
          signer: true;
          relations: ["vaultType"];
        },
        {
          name: "newAuthority";
          docs: ["the `accept_vault_type_authority` instruction."];
        },
      ];
      args: [];
    },
    {
      name: "rollOverVaultType";
      discriminator: [233, 161, 46, 228, 96, 94, 245, 57];
      accounts: [
        {
          name: "vaultType";
          writable: true;
        },
      ];
      args: [];
    },
    {
      name: "transferVaultTypeToken";
      discriminator: [205, 135, 61, 255, 94, 248, 153, 69];
      accounts: [
        {
          name: "vaultType";
        },
        {
          name: "authority";
          signer: true;
          relations: ["vaultType"];
        },
        {
          name: "mint";
          relations: ["vaultType"];
        },
        {
          name: "source";
          writable: true;
        },
        {
          name: "destination";
          writable: true;
        },
        {
          name: "tokenProgram";
          relations: ["vaultType"];
        },
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
      ];
    },
    {
      name: "withdraw";
      discriminator: [183, 18, 70, 156, 148, 109, 161, 34];
      accounts: [
        {
          name: "vault";
          writable: true;
        },
        {
          name: "vaultType";
          writable: true;
          relations: ["vault"];
        },
        {
          name: "userAuthority";
          signer: true;
          relations: ["vault"];
        },
        {
          name: "mint";
          relations: ["vaultType"];
        },
        {
          name: "pool";
          writable: true;
          relations: ["vaultType"];
        },
        {
          name: "reserve";
          writable: true;
          relations: ["vaultType"];
        },
        {
          name: "to";
          writable: true;
        },
        {
          name: "tokenProgram";
          relations: ["vaultType"];
        },
      ];
      args: [
        {
          name: "amount";
          type: "u64";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "vault";
      discriminator: [211, 8, 232, 43, 2, 152, 117, 119];
    },
    {
      name: "vaultType";
      discriminator: [251, 71, 249, 103, 117, 71, 62, 101];
    },
  ];
  types: [
    {
      name: "vault";
      type: {
        kind: "struct";
        fields: [
          {
            name: "userAuthority";
            docs: ["The pubkey of the authority (usually the user)."];
            type: "pubkey";
          },
          {
            name: "vaultType";
            docs: ["The pubkey of the vault type."];
            type: "pubkey";
          },
          {
            name: "amount";
            docs: ["The amount of token the user has deposited."];
            type: "u64";
          },
          {
            name: "inactiveAt";
            docs: ["The timestamp when the vault becomes inactive."];
            type: "i64";
          },
          {
            name: "status";
            docs: ["Current vault status."];
            type: {
              defined: {
                name: "vaultStatus";
              };
            };
          },
          {
            name: "bump";
            docs: ["The bump seed of this pda."];
            type: "u8";
          },
        ];
      };
    },
    {
      name: "vaultStatus";
      docs: [
        "An enum representing the status of a Vault.",
        "After deposit, it becomes Active, and must be Inactive to withdraw.",
      ];
      type: {
        kind: "enum";
        variants: [
          {
            name: "active";
          },
          {
            name: "deactivating";
          },
          {
            name: "inactive";
          },
        ];
      };
    },
    {
      name: "vaultType";
      docs: [
        "A system-wide fund management structure created by the administrator.",
        "One is created for each SPL token that can be deposited.",
      ];
      type: {
        kind: "struct";
        fields: [
          {
            name: "identity";
            docs: [
              "The identity pubkey which matches the authority initially.",
              "It is maintained separately from the authority to allow changing the authority without affecting the PDA.",
            ];
            type: "pubkey";
          },
          {
            name: "authority";
            docs: [
              "The pubkey of the authority which can be changed with `update_vault_type_authority` instruction.",
            ];
            type: "pubkey";
          },
          {
            name: "pendingAuthority";
            docs: [
              "The pubkey of the pending authority which will be set after `update_vault_type_authority` instruction.",
            ];
            type: {
              option: "pubkey";
            };
          },
          {
            name: "mint";
            docs: ["The pubkey of the token mint to be deposited to vaults."];
            type: "pubkey";
          },
          {
            name: "pool";
            docs: [
              "The pubkey of the pool token account where deposited tokens are collected.",
            ];
            type: "pubkey";
          },
          {
            name: "reserve";
            docs: [
              "The pubkey of the reserve token account where tokens are collected for withdrawal.",
            ];
            type: "pubkey";
          },
          {
            name: "tokenProgram";
            docs: [
              "The pubkey of the token program (spl_token or spl_token_2022).",
            ];
            type: "pubkey";
          },
          {
            name: "seasonStart";
            docs: ["The start timestamp of the current season."];
            type: "i64";
          },
          {
            name: "seasonDuration";
            docs: ["The duration of each season in seconds."];
            type: "i64";
          },
          {
            name: "deactivationLockWindow";
            docs: [
              "The duration, while users cannot initiate deactivation, at the end of each season, in seconds.",
            ];
            type: "i64";
          },
          {
            name: "cooldownWindow";
            docs: [
              "The duration of the cooldown period at the end of each season, in seconds,",
              "during which administrators perform maintenance work on the vaults.",
              "Currently not used to restrict any operations, but may be used in the future to disable deposits.",
            ];
            type: "i64";
          },
          {
            name: "maxDepositPerUser";
            docs: [
              "The maximum amount of tokens that can be deposited to each vault. No limit if 0.",
            ];
            type: "u64";
          },
          {
            name: "totalDeposit";
            docs: [
              "The total amount of tokens deposited across all vaults belonging to this vault type.",
            ];
            type: "u64";
          },
          {
            name: "instantDeactivation";
            docs: [
              "If true, users can instantly deactivate their vaults to Inactive state.",
              "Otherwise, vaults enter Deactivating state and can transition to Inactive at the start of next season.",
            ];
            type: "bool";
          },
          {
            name: "isLocked";
            docs: [
              "If true, belonging vaults are locked and cannot be deactivated for withdrawal.",
              "This does not affect already deactivating and inactive vaults.",
            ];
            type: "bool";
          },
          {
            name: "bump";
            docs: ["The bump seed of this pda."];
            type: "u8";
          },
        ];
      };
    },
  ];
};
