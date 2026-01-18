use anchor_lang::prelude::*;

declare_id!("7bakb28179KMC9fjosEHtFejynWhkrC8oWLXdZybb8gg");

#[program]
pub mod anchor {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
