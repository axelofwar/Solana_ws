import {
  Connection,
  GetProgramAccountsFilter,
  clusterApiUrl,
  PublicKey,
  Keypair,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import { Metaplex, keypairIdentity } from "@metaplex-foundation/js";
import * as metadata from "./metadata";

const rpcEndpoint =
  "https://quiet-sleek-frost.solana-mainnet.discover.quiknode.pro/9462baba5484683855a1b5c2895efe9693c55b90/";
const solanaConnection = new Connection(rpcEndpoint);

const metaplexEndpoint = "https://api.metaplex.solana.com/";
const metaplexConnection = new Connection(metaplexEndpoint);

const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
// eventually want to repalce this with a free RPC endpoint with good APIs

const walletToQuery = "D8GbJQErCmFuMGtWMaSREoEy8jJApaVVdNwehZY4PAbR";

async function getTokenAccounts(wallet: string, solanaConnection: Connection) {
  const filters: GetProgramAccountsFilter[] = [
    {
      dataSize: 165, //size of account (bytes)
    },
    {
      memcmp: {
        offset: 32, //location of our query in the account (bytes)
        bytes: wallet, //our search criteria, a base58 encoded string
      },
    },
  ];

  const accounts = await solanaConnection.getParsedProgramAccounts(
    TOKEN_PROGRAM_ID,
    { filters: filters }
  );

  console.log(
    `Found ${accounts.length} token account(s) for wallet ${wallet}.`
  );
  accounts.forEach((account, i) => {
    //Parse the account data
    const parsedAccountInfo: any = account.account.data;
    const mintAddress: string = parsedAccountInfo["parsed"]["info"]["mint"];
    const tokenBalance: number =
      parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
    //Log results
    console.log(`Token Account No. ${i + 1}: ${account.pubkey.toString()}`);
    console.log(`--Token Mint: ${mintAddress}`);
    console.log(`--Token Balance: ${tokenBalance}`);

    (async () => {
      const keypair = Keypair.generate();
      const metaplex = new Metaplex(connection);
      metaplex.use(keypairIdentity(keypair));

      /* mainnet-beta RPC endpoint disabled - other's return object not data
      const owner = new PublicKey(walletToQuery);
      const allNFTs = await metaplex.nfts().findAllByOwner({ owner });
      console.log(`--ALL NFTS: ${allNFTs}`);

      // cannot pass mint as example suggests - nor as fix on owner above suggests
      const Mint = new PublicKey(mintAddress);
      const nft = await metaplex.nfts().findByMint({ Mint }); //- FindNftByMintInput type error
      console.log(nft.metadata);
      */
      const mint = await metadata.getMetadataAccount(mintAddress);
      const accInfo = await connection.getAccountInfo(new PublicKey(mint));

      if (accInfo?.data != null) {
        console.log(metadata.decodeMetadata(accInfo!.data));
        console.log(`Bytes Per element: ${accInfo.data.BYTES_PER_ELEMENT}`);
      }
    })();

    /* Experiments on other RPC endpoints
    (async () => {
      // const pubKey = new PublicKey(mintAddress.toString());
      const programId = new PublicKey(mintAddress.toString());
      let [pda, bump] = await PublicKey.findProgramAddress(
        [Buffer.from("test")],
        programId
      );

      console.log(`bump: ${bump}, pubkey: ${pda.toBase58()}`);

      const MetaDataPrint = await solanaConnection.getAccountInfo(pda);
      // console.log(await solanaConnection.getAccountInfo(publicKey));
      // const metaDataStuff: Buffer = MetaDataPrint?.data!;
      console.log(`--NFT MetaData: ${MetaDataPrint?.data!}`);
    })();

    const pubKeyForNFT = new PublicKey(mintAddress);
    console.log(
      `--Token MetaData:`,
      solanaConnection.getAccountInfo(pubKeyForNFT)
    );

    const nftsMetadata = Metadata.fromAccountAddress(
      metaplexConnection,
      new PublicKey(mintAddress),
      "confirmed"
    );

    const nftMetaDataTest = metaplexConnection.getAccountInfo(
      new PublicKey(mintAddress),
      "confirmed"
    );

    const metaDataUrl = `https://public-api.solscan.io/token/meta?tokenAddress=${mintAddress}`;

    console.log(`--NFT Metaplex Object MetaData: ${nftsMetadata}`);
    console.log(`--NFT Solscan MetaData: ${metaDataUrl}`);
    console.log(`--NFT MetaPlex EndPoint Token MetaData: ${nftMetaDataTest}`);
  */
  });
}

getTokenAccounts(walletToQuery, solanaConnection);
