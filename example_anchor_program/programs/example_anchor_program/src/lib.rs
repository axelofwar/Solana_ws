use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod example_anchor_program {
    use super::*;
    // account is a wrapper of type AccountInfo, which has fields like PubKey, is_signer, data, owner, etc.
    // we access the 'info struct to get access to this wrapped data
    // the data field of that struct is the account that we recognize as the user who called the instruction
    // this data field is what will be used to call instructions on the user account
    pub fn initialize_acc(ctx: Context<InitializeAcc>, data: u64) -> Result<()> {
        let my_account = &mut ctx.accounts.my_account; 
        my_account.data = data; // set the data from initialize struct
        Ok(())
    }

    pub fn initialize_count(ctx: Context<InitializeNum>, data: u64) -> Result<()> {
        let number = &mut ctx.accounts.number; 
        number.num = 0; // set 0 for the counter
        Ok(())
    }

    pub fn update(ctx: Context<Update>, data: u64) -> Result<()> {
        let my_account = &mut ctx.accounts.my_account;
        my_account.data = data;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let number = &mut ctx.accounts.number; // use number NOT num because that's the member of Increment struct
        number.num +=1; // access num member of Counter type, which is the type filled from 'info in the number member of increment
        Ok(())
    }

    // pub fn decrement(ctx: Context<Decrement>, data: u64) -> Result<()> {
    //     let my_account = &mut ctx.accounts.my_account; 
    //     my_account.data = data; // set the data from initialize struct
    //     Ok(())
    // }
}

// we need to define the account struct before utilizing it
// this means initalizing the Context object = 'info wrapped Account
// this Context object takes program_id : PubKey = of the program - aka init
// accounts: mut T = the user account we will use to do stuff - needs to be mut
// bumps = the space that the account needs to take on-chain

#[derive(Accounts)]
pub struct InitializeAcc<'info> {
    #[account(init, payer = user, space = 8 + 8)] 
    pub my_account: Account<'info, MyAccount>,
    #[account(mut)] // define the user info as mutable because we want to set Signer
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Update<'info> {
    #[account(mut)] // define my_account as mutable because we want to update it with the data passed in the fn/instruction call
    pub my_account: Account<'info, MyAccount>, // the 'info of the account is updated with the data from custom type MyAccount
}

// ==== COUNTER FUNCTIONS ==== //
// here we use the same 'info object because it allows us to access the 
#[derive(Accounts)]
pub struct InitializeNum<'info> {
    #[account(init, payer = user, space = 8 + 8)] 
    pub number: Account<'info, Counter>,
    #[account(mut)] // define the user info as mutable because we want to set Signer
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut, has_one = authority)]
    pub number: Account<'info, Counter>, // type counter has a num but still need authority member
    pub authority: Signer <'info>

}

#[account]
pub struct MyAccount { // the definition of our custom type that will hold the accuont data that we will pass to the instructions
    pub data: u64,
}

#[account]
pub struct Counter {
    pub authority: Pubkey, 
    pub num : u64,
}