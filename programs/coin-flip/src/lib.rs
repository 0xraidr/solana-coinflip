use anchor_lang::{prelude::*, system_program};
use anchor_lang::system_program::Transfer;
use crate::system_program::transfer;
declare_id!("4QKTSJF4jf8MQfpdtA3SWtjXtdfyrZJr4eapARybVAjG");


#[program]
pub mod coinflip {
    use super::*;
    
    pub fn play(ctx: Context<Bet>, user_flip: u8, bet_amount: u64) -> Result<()> {


        // ADDING ERROR HANDLING FOR USERS CHOICE AND BET AMOUNT.


        require!( user_flip == 0 || user_flip == 1, FlipError::InvalidFlip);
        let user_flip_text = match user_flip {
            0 => "Heads",
            1 => "Tails",
            _ => "Error" //let's add error handle
        }.to_string();

        require!( bet_amount == 1 || bet_amount == 2, FlipError::InvalidBet);
        let user_bet_text = match bet_amount {
            1 => "1 SOL",
            2 => "2 SOL",
            _ => "Error" //let's add error handle
        }.to_string();


        // THIS IS THE BET AMOUNT TRANSFERING TO TOKEN VAULT AKA ESCROW.

        let bet_deposit = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.player.to_account_info(),
                to: ctx.accounts.token_vault.to_account_info(),
            },
        );
        system_program::transfer(bet_deposit, bet_amount)?;

        msg!("Player selected {} and bet {}", user_flip_text, user_bet_text);


        // THIS IS FLIPPING THE COIN TO GET RESULTS.


        let clock = Clock::get().unwrap();
        let flip_result:u8 = (clock.unix_timestamp % 2).try_into().unwrap();
        let flip_result_text = match flip_result {
            0 => "Heads",
            1 => "Tails",
            _ => "Error" //let's add error handle
        }.to_string();

        let winner = flip_result == user_flip;
        let result_text = if winner {"Win"} else {"Lose"}.to_string();

        msg!("{}: Player selected {} and the coin flip was {}!", result_text, user_flip_text, flip_result_text);
      
        let streak = &mut ctx.accounts.win_streak;
        msg!("Winning streak before: {}", streak.counter);

        if winner {
            
            let accounts = Transfer {
                from: ctx.accounts.token_vault.to_account_info(),
                to: ctx.accounts.player.to_account_info(),
            };

            transfer(CpiContext::<system_program::Transfer>::new_with_signer(ctx.accounts.system_program.to_account_info(), 
            accounts, &[&[b"escrow", ctx.accounts.player.key().as_ref(), &[*ctx.bumps.get("token_vault").unwrap()]]]), bet_amount * 2)?;
        
            streak.counter += 1;
        }

        else {
            streak.counter = 0;
            msg!("Sorry! You Lost!");
        }
        msg!("Winning streak: {}", streak.counter);
     
        Ok(())
        
    }
}

#[derive(Accounts)]
pub struct Bet<'info> {
    #[account(mut)]
    pub player: Signer<'info>,
    ///CHECK: we aren't reading anything from this account
    #[account(mut, seeds=[b"escrow",player.key().as_ref()], bump)]
    pub token_vault: AccountInfo<'info>,
    pub system_program: Program<'info, System>,

    #[account(
        init_if_needed,
        payer = player,
        space = 8+8,
        seeds = [b"winning_streak".as_ref(), player.key().as_ref()], bump
    )]
    pub win_streak: Account<'info,Streak>,
}


#[account]
pub struct Streak {
    pub counter: u8,
}
impl Default for Streak {
    fn default() -> Self {
        Streak { counter: (0) }
    }
}

#[error_code] 
pub enum FlipError {
    #[msg("Flip must be Heads or Tails (0 or 1).")]
    InvalidFlip,
    #[msg("Bet must be 1 or 2 SOL.")]
    InvalidBet,
    #[msg("Looks like the fee is going to the wrong location!")]
    InvalidFeeDestination,
    #[msg("The mint address provided is not valid")]
    InvalidMintAddress
}

