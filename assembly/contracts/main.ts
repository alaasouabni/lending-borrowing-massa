import {
  Args,
  u64ToBytes,
  bytesToString,
  stringToBytes,
  u256ToBytes,
  serializableObjectsArrayToBytes,
  Serializable,
  Result,
} from '@massalabs/as-types';
import {
  Address,
  Context,
  Storage,
  call,
  createEvent,
  generateEvent,
  transferCoins,
} from '@massalabs/massa-as-sdk';

import {
  PersistentMap
} from '@massalabs/massa-as-sdk/assembly/collections';


const ONE_UNIT = 10 ** 9;
const ONE_TENTH = 10 ** 8;

// export const nftArrayKey = stringToBytes('nfts');
// export const nftUserArrayKey = stringToBytes('nfts_users');
// export const nftContractCodeKey = stringToBytes('nft_contract_code');



// export const ownerKey = 'nft_owner_key';

// export const userProfileKey = 'userProfile_';

// export const marketplaceFeeKey = 'marketplaceFee_'; // In 1/1000th. A fee of 10 is 1%.
// export const marketplaceOwnerKey = 'marketplaceOwner_';

// export const sellOfferKey = 'sellOffer_';
// export const saleHistoryKey = 'saleHistory_';



export const minLoanAmountKey = stringToBytes('min_loan_amount');
export const maxLoanAmountKey = stringToBytes('max_loan_amount');
export const minInterestRateKey = stringToBytes('min_interest_rate');
export const maxInterestRateKey = stringToBytes('max_interest_rate');
const loansMap = new PersistentMap<string, string>("loans");



class Loan implements Serializable {
  constructor(
  public amount: u64,
  public interest: u8,
  public duration: u64,
  public repaymentAmount: u64,
  public fundingDeadline: u64,
  public borrower: Address, 
  public lender: Address,
  public active: boolean,
  public repaid: boolean,
  ){}



}



/**
 * This function is meant to be called only one time: when the contract is deployed.
 *
 * @param args - The arguments to the constructor containing the message to be logged
 */
export function constructor(binaryArgs: StaticArray<u8>): void {
  // This line is important. It ensures that this function can't be called in the future.
  // If you remove this check, someone could call your constructor function and reset your smart contract.
  if (!Context.isDeployingContract()) {
    return;
  }
  const args = new Args(binaryArgs);

  let min_loan_amount = args
    .nextU256()
    .expect('min_loan_amount argument is missing or invalid');
    let max_loan_amount = args
    .nextU256()
    .expect('max_loan_amount argument is missing or invalid');
    let min_interest_rate = args
    .nextU256()
    .expect('min_interest_rate argument is missing or invalid');
    let max_interest_rate = args
    .nextU256()
    .expect('max_interest_rate argument is missing or invalid');


  // Storage.set(nftContractCodeKey, StaticArray.fromArray(nft_contract_code));
  // Storage.set(nftArrayKey, new Args().add<Array<string>>([]).serialize());
  // Storage.set(marketplaceOwnerKey, marketplaceOwner);
  // Storage.set(marketplaceFeeKey, bytesToString(u64ToBytes(marketplaceFee)));

  Storage.set(minLoanAmountKey, u256ToBytes(min_loan_amount));
  Storage.set(maxLoanAmountKey, u256ToBytes(max_loan_amount));
  Storage.set(minInterestRateKey, u256ToBytes(min_interest_rate));
  Storage.set(maxInterestRateKey, u256ToBytes(max_interest_rate));
  

  generateEvent("all parameters set");
}

export function createLoan(): void{
  const newLoan = new Loan(
    1000,
    5,
    30,
    1050,
    Date.now() + (24 * 60 * 60 * 1000), // Funding deadline 24 hours from now
    Context.caller(), // Example address
    new Address("0"), // Example address
    true,
    false
  );

  const args = new Args().add(newLoan).serialize();
  loansMap.set(loansMap.size().toString(),bytesToString(args));

  generateEvent("Loan Created");

}


export function getLoan(loanId:string): string | null{
  return(loansMap.get(loanId))
  }