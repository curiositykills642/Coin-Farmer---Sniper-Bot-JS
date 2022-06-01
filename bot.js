// line 12 for ur wallet
// line 19 for seed
// line 173 for check open trade and 175 for delay block 159 for gas , 158 for number of times


const ethers = require('ethers');

const addresses = {
    WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    recipient: '0x6D9bE324aeE243DA55A22D28f90cD6A94d27Dda4'  // add your wallet addy here currently mine is entered.
}

// IMPORTANT: First address of this mnemonic must have enough BNB to pay for tx fess

let mnemonic;
if (true) {
    mnemonic = ''; // enter your mnemonic here.
}

//let wss_endpoint = "wss://speedy-nodes-nyc.moralis.io/0c317a692c1dbd7527e326c2/bsc/mainnet/ws";
//const provider = new ethers.providers.WebSocketProvider(wss_endpoint);
const provider = new ethers.providers.WebSocketProvider('wss://bsc.getblock.io/mainnet/?api_key=faa16264-5241-4ce7-a866-cb14b8243bdf');

const wallet = ethers.Wallet.fromMnemonic(mnemonic);
const account = wallet.connect(provider);
const factory = new ethers.Contract(
    addresses.factory, ['event PairCreated(address indexed token0, address indexed token1, address pair, uint)'],
    account
);

const router = new ethers.Contract(
    addresses.router, [
        'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
        'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)'
    ],
    account
);

const wbnb = new ethers.Contract(
    addresses.WBNB, [
        'function approve(address spender, uint amount) public returns(bool)',
    ],
    account
);

//start

const init = async() => {
    const tx = await wbnb.approve(
        router.address,
        "10000000000000000000" // 1000000000000000000 = 1bnb
    );
    const receipt = await tx.wait();
    console.log('Transaction receipt');
    console.log(receipt);
}

async function buy(money, tokenIn, tokenOut, gas) {

    const amountIn = ethers.utils.parseUnits(money, 'ether');
    let amounts;
    let counts = 0;

    let amountOutMin = 1;

    let options = {
        value: amountIn,
        gasLimit: 2000000,
        gasPrice: ethers.utils.parseUnits(gas, 'gwei'),
    };

    amounts = await router.getAmountsOut(amountIn, [tokenIn, tokenOut]);
    amounts = amounts[1].toString();

    const tx = await router.swapExactETHForTokens(
        amountOutMin, [tokenIn, tokenOut],
        addresses.recipient,
        Math.floor((Date.now() + 1000 * 60 * 10) / 1000),
        options
    );

    console.log();
    console.log(`Swapping BNB for tokens...`);
    const receipt = await tx.wait();
    console.log(`Transaction hash: ${receipt.transactionHash}`);
    console.log();

    return true;
}

//end


//---- PARAMETERS TO BE SET ----
let money = "0.01";
let address = ""; // token to buy
let times = 1;
let gas = '10';


/*if (buy_every_block) {
    gas = '6';
}*/

// For inline-parameter.
// Usage : node bot.js <money> <ca>
var myArgs = process.argv.slice(2);
if (myArgs.length > 0) {
    money = myArgs[0];
    address = myArgs[1];

    if (address.includes("poocoin")) {
        const myArr = address.split("tokens/")[1];
        //console.log(chalk.blue("URL detected : CA = ") + myArr);
        address = myArr;
    }
}


buy(money, addresses.WBNB, address, gas);
// WARNING : set the last parameter to 'true' for real buy, default = false
