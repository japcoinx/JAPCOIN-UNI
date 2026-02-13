
// ... existing imports
import { Course, User, NFT, Achievement, JapDriveFile, Job } from './types';

export const JAP_CONTRACT_ADDRESS = '0x372cefcddf87ddb5e1d5de8399a47afda2d8e189';

// ... existing contract codes ... 
export const JAP_REWARDS_CONTRACT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract JapEngagementRewards {
    IERC20 public jap;
    address public validator; // AI / Tutor / DAO signer

    mapping(address => uint256) public totalEarned;
    mapping(bytes32 => bool) public processedActions;

    event RewardPaid(address indexed user, uint256 amount, string action);

    constructor(address _jap, address _validator) {
        jap = IERC20(_jap);
        validator = _validator;
    }

    modifier onlyValidator() {
        require(msg.sender == validator, "Not authorized");
        _;
    }

    function rewardUser(
        address user,
        uint256 amount,
        string calldata action,
        bytes32 actionId
    ) external onlyValidator {
        require(!processedActions[actionId], "Already rewarded");
        processedActions[actionId] = true;

        totalEarned[user] += amount;
        jap.transfer(user, amount);

        emit RewardPaid(user, amount, action);
    }

    function updateValidator(address newValidator) external onlyValidator {
        validator = newValidator;
    }
}`;

export const JAP_CAMPUS_REWARDS_CONTRACT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract JapCampusRewards {
    IERC20 public jap;
    address public validator;

    mapping(address => uint256) public totalEarned;
    mapping(bytes32 => bool) public rewardedActions;

    event CampusReward(address indexed user, uint256 amount, string action);

    constructor(address _jap, address _validator) {
        jap = IERC20(_jap);
        validator = _validator;
    }

    modifier onlyValidator() {
        require(msg.sender == validator, "Not authorized");
        _;
    }

    function reward(
        address user,
        uint256 amount,
        string calldata action,
        bytes32 actionId
    ) external onlyValidator {
        require(!rewardedActions[actionId], "Already rewarded");

        rewardedActions[actionId] = true;
        totalEarned[user] += amount;
        jap.transfer(user, amount);

        emit CampusReward(user, amount, action);
    }
}`;

export const JAP_DRIVE_MESSAGES_CONTRACT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract JapDriveMessages {

    struct MessagePointer {
        address sender;
        string contentHash; // IPFS / JAP DRIVE hash
        uint256 timestamp;
        string context; // course, DM, DAO, etc
    }

    mapping(address => MessagePointer[]) private userMessages;

    event MessageStored(address indexed sender, string hash);

    function storeMessage(
        string calldata contentHash,
        string calldata context
    ) external {
        userMessages[msg.sender].push(
            MessagePointer(
                msg.sender,
                contentHash,
                block.timestamp,
                context
            )
        );

        emit MessageStored(msg.sender, contentHash);
    }

    function getMyMessages() external view returns (MessagePointer[] memory) {
        return userMessages[msg.sender];
    }
}`;

export const JAP_CAMPUS_BADGES_CONTRACT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract JapCampusBadges is ERC721 {
    address public issuer;
    uint256 public nextId;

    mapping(uint256 => string) public badgeName;
    mapping(address => mapping(string => bool)) public earned;

    constructor() ERC721("JAP Campus Badges", "JAPCAMP") {
        issuer = msg.sender;
    }

    modifier onlyIssuer() {
        require(msg.sender == issuer, "Not issuer");
        _;
    }

    function mint(address user, string calldata name) external onlyIssuer {
        require(!earned[user][name], "Already earned");

        nextId++;
        _mint(user, nextId);
        badgeName[nextId] = name;
        earned[user][name] = true;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256,
        uint256
    ) internal pure {
        require(from == address(0) || to == address(0), "Soulbound");
    }
}`;

export const JAP_MENTOR_REGISTRY_CONTRACT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract JapMentorRegistry {
    struct Mentor {
        address owner;
        string role; // Trader, Dev, AI, CEO, Quantum
        bool active;
    }

    mapping(uint256 => Mentor) public mentors;
    uint256 public mentorCount;

    event MentorRegistered(uint256 indexed id, address indexed owner, string role);

    function registerMentor(string calldata role) external {
        mentorCount++;
        mentors[mentorCount] = Mentor(msg.sender, role, true);
        emit MentorRegistered(mentorCount, msg.sender, role);
    }
    
    function getMentor(uint256 id) external view returns (Mentor memory) {
        return mentors[id];
    }
    
    function toggleStatus(uint256 id) external {
        require(msg.sender == mentors[id].owner, "Not owner");
        mentors[id].active = !mentors[id].active;
    }
}`;

export const JAP_USAGE_TRACKER_CONTRACT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract JapUsageTracker {
    mapping(address => uint256) public usageCount;

    event UsageLogged(address indexed user, uint256 units);

    function logUsage(address user, uint256 units) external {
        usageCount[user] += units;
        emit UsageLogged(user, units);
    }
}`;

export const JAP_STICKER_NFT_CONTRACT_CODE = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract JapStickerNFT is ERC1155 {
    address public minter;
    
    constructor() ERC1155("https://api.japcoin.edu/stickers/{id}.json") {
        minter = msg.sender;
    }

    function mint(address account, uint256 id, uint256 amount) external {
        require(msg.sender == minter, "Not minter");
        _mint(account, id, amount, "");
    }
}`;

export const JOBS: Job[] = [
  {
    id: 'job_1',
    title: 'Short-Form Video Editor',
    type: 'Bounty',
    category: 'Content',
    reward: '500 JAP / Video',
    description: 'Edit 60-second educational clips for TikTok and Reels. Take our long-form lectures and turn them into viral moments.',
    requirements: ['Experience with CapCut or Premiere', 'Fast turnaround time', 'Understanding of crypto memes']
  },
  {
    id: 'job_2',
    title: 'Social Media Manager',
    type: 'Part-Time',
    category: 'Marketing',
    reward: '3,000 JAP / Month',
    description: 'Manage the official Japcoin University Twitter (X) and Instagram. Schedule posts, engage with students, and grow the follower base.',
    requirements: ['Proven track record of growth', 'Native English proficiency', 'Deep DeFi knowledge']
  },
  {
    id: 'job_3',
    title: 'University Ambassador',
    type: 'Ambassador',
    category: 'Community',
    reward: '1,000 JAP / Event',
    description: 'Host physical or digital meetups for Japcoin University. Spread the word on your local campus or community.',
    requirements: ['Must be a Certified Tier student', 'Good public speaking skills', 'Network of 50+ people']
  },
  {
    id: 'job_4',
    title: 'Open Source React Developer',
    type: 'Bounty',
    category: 'Development',
    reward: 'Variable (Based on PR)',
    description: 'Contribute to the Japcoin University codebase. Pick up tickets from our GitHub, fix bugs, or build new features.',
    requirements: ['React & TypeScript proficiency', 'Git/GitHub experience', 'Clean code practices']
  },
  {
    id: 'job_5',
    title: 'Discord Moderator',
    type: 'Part-Time',
    category: 'Community',
    reward: '1,500 JAP / Month',
    description: 'Keep the peace in our Discord server. Answer support tickets, ban bots, and facilitate discussion.',
    requirements: ['Active daily', 'Conflict resolution skills', 'Previous mod experience']
  }
];

const MOCK_NFTS: NFT[] = [
  {
    id: 'nft_1',
    name: 'Genesis Scholar',
    rarity: 'Rare',
    image: 'https://picsum.photos/400/400?random=100',
    description: 'Awarded to the first 10,000 students. Redeemable for premium access on Japcoinx.'
  },
  {
    id: 'nft_2',
    name: 'Solidity Architect',
    rarity: 'Legendary',
    image: 'https://picsum.photos/400/400?random=101',
    description: 'Mastery of smart contracts. Grants 0% trading fees on Japcoin DEX.'
  }
];

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_1',
    title: 'First Step',
    description: 'Completed your first course.',
    icon: '🎓',
    unlockedAt: Date.now() - 10000000
  },
  {
    id: 'ach_2',
    title: 'Diamond Hands',
    description: 'Held JAP tokens for 30 days.',
    icon: '💎',
    unlockedAt: Date.now() - 5000000
  },
  {
    id: 'ach_3',
    title: 'White Hat',
    description: 'Passed the Security Essentials exam.',
    icon: '🛡️',
    unlockedAt: undefined // Locked
  }
];

export const MOCK_DRIVE_FILES: JapDriveFile[] = [
  {
    id: 'f1',
    name: 'JAP_University_Diploma.pdf',
    type: 'cert',
    size: '2.4 MB',
    cid: 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco',
    uploadedAt: Date.now() - 86400000,
    encrypted: true
  },
  {
    id: 'f2',
    name: 'Solidity_Cheatsheet_v4.pdf',
    type: 'pdf',
    size: '850 KB',
    cid: 'QmZ4tDuvesjQkDDP1mXWo6ucoXoypizjW3WknFiJnKLwHC',
    uploadedAt: Date.now() - 172800000,
    encrypted: false
  },
  {
    id: 'f3',
    name: 'Project_Alpha_Whitepaper.doc',
    type: 'doc',
    size: '1.2 MB',
    cid: 'QmP1mXWo6ucoXoypizjW3WknFiJnKLwHCnL72vedxjQkD',
    uploadedAt: Date.now() - 604800000,
    encrypted: true
  },
  {
    id: 'f4',
    name: 'Avatar_Source_File.png',
    type: 'img',
    size: '4.5 MB',
    cid: 'QmKLwHCnL72vedxjQkDDP1mXWo6ucoXoypizjW3WknFiJ',
    uploadedAt: Date.now() - 1209600000,
    encrypted: false
  }
];

export const MOCK_USER: User = {
  id: 'u123',
  name: 'Crypto Scholar',
  headline: 'Blockchain Developer | DeFi Enthusiast | Building the Future',
  location: 'Kyoto, Japan (Metaverse)',
  email: 'scholar@japcoin.edu',
  walletAddress: '0x71C...9A23',
  japBalance: 1450,
  stakedJap: 5000,
  completedCourses: [1],
  japId: 'did:jap:73x9...k2m1',
  isVerified: true,
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  coverImage: 'https://picsum.photos/1200/300?random=50',
  bio: 'Passionate about decentralization and financial sovereignty. Currently learning Solidity and React to build the next unicorn DApp. Open to collaborations on Hackathons.',
  dateJoined: Date.now() - 1000 * 60 * 60 * 24 * 45, // Joined 45 days ago
  referralCode: 'SCHOLAR2026',
  referralCount: 12,
  nfts: MOCK_NFTS,
  achievements: MOCK_ACHIEVEMENTS,
  subscriptionTier: 'STANDARD',
  appsCreated: 0,
  websitesCreated: 0,
  ebooksCreated: 0,
  musicCreated: 0,
  
  // AI Mentor Data
  level: 'Beginner',
  failedQuizCount: 3,
  tradingRiskScore: 75
};

// ... existing COURSES export
export const COURSES: Course[] = [
  // --- TRACK 1: FUNDAMENTALS ---
  {
    id: 1,
    title: 'JAP-101: Blockchain Fundamentals',
    description: 'The prerequisites. Understand the underlying technology of Bitcoin, Ethereum, and the Japcoin ecosystem.',
    level: 'Beginner',
    reward: 100,
    duration: '2h 30m',
    image: 'https://picsum.photos/400/225?random=1',
    progress: 100,
    modules: [
      {
        id: 1,
        title: "The Distributed Ledger",
        duration: "45m",
        content: `### The Giant Shared Notebook

Imagine a classroom where everyone has a special notebook. Usually, the teacher (like a bank) keeps the grade book, and only the teacher can write in it. If the teacher makes a mistake or loses the book, everyone is in trouble!

A **Blockchain** is different. In a blockchain world, **every single student** gets a copy of the same notebook. 

[VISUAL: BLOCKCHAIN]

#### How it Works:
1.  **Writing it Down**: When Johnny gives 5 apples to Suzy, everyone in the class opens their notebook and writes: "Johnny gave 5 apples to Suzy."
2.  **Checking the Math**: Everyone checks to make sure Johnny actually *had* 5 apples. If he didn't, the class shouts, "No way!" and they don't write it down.
3.  **Permanent Ink (Hashing)**: Once everyone writes it down, it's written in permanent marker. We use a "Hash" (like a digital fingerprint) to seal the page. If anyone tries to change even a comma on a previous page, the fingerprint changes, and everyone knows it's fake.

#### Why is this cool?
*   **No Teacher Needed**: We don't need a boss to tell us what is true. We all agree together.
*   **Safe and Sound**: If one student loses their notebook, it's okay! 29 other students still have the correct copy.
*   **Open for Everyone**: Anyone can look at the notebook to see what happened. No secrets!

This "Shared Notebook" is what we call a **Distributed Ledger**. "Distributed" means shared everywhere, and "Ledger" is just a fancy word for a list of transactions.`
      },
      {
        id: 2,
        title: "Consensus Mechanisms",
        duration: "60m",
        content: `### How Do We Agree?

In our magical classroom, we need a rule for who gets to turn the page and write the next batch of transactions. This rule is called a **Consensus Mechanism**. It's a big word that just means "How we all agree."

[VISUAL: CONSENSUS]

#### Proof of Work (The Puzzle Solver)
Think of Bitcoin like a race. 
*   The teacher writes a really hard math problem on the board.
*   All the students (miners) race to solve it.
*   The first one to solve it yells "EUREKA!" 
*   Everyone checks to make sure their answer is right. If it is, that student gets a gold star (Bitcoin) and gets to write the next page in the notebook.
*   **The Catch**: Solving the puzzle takes a lot of brainpower and energy (electricity).

#### Proof of Stake (The Promise Keeper)
Think of Ethereum like a quiet circle.
*   To join the circle, you have to put your favorite toy (your money) in a glass locker. This is called "Staking".
*   If you follow the rules and write the truth, you get your toy back plus a candy.
*   If you lie or try to cheat, the teacher takes your toy away forever!
*   Because you don't want to lose your toy, you promise to be good.
*   **The Benefit**: We don't need to run a race or use lots of energy. We just need to trust that people love their toys (money).`
      }
    ]
  },
  {
    id: 14,
    title: 'HIS-101: The History of Money',
    description: 'From barter to Bitcoin. Understand the evolution of currency and why decentralized money is the next step.',
    level: 'Beginner',
    reward: 50,
    duration: '1h 00m',
    image: 'https://picsum.photos/400/225?random=14',
    progress: 0,
    modules: [
        {
            id: 1,
            title: "Properties of Money",
            duration: "30m",
            content: `### The Story of Stuff

Long ago, before dollar bills or credit cards, if you wanted shoes, you had to trade something for them. 

#### 1. Barter (The Trade)
Imagine you have chickens, but you want shoes. You have to find a shoemaker who *wants* chickens. If the shoemaker is vegan, you are out of luck! This is called the "Double Coincidence of Wants," which is a fancy way of saying "It's really hard to match trades.

#### 2. Gold (The Shiny Rock)
People realized we needed something everyone likes. Gold was perfect because:
*   **It lasts forever**: It doesn't rot like an apple.
*   **It's rare**: You can't just pick it up off the ground everywhere.
*   **It's divisible**: You can melt it into smaller coins.

#### 3. Cryptocurrency (The Digital Gold)
Bitcoin was invented to be like gold (rare and hard to get) but easy to send like an email. 
*   **Scarcity**: There will only ever be 21 million Bitcoins.
*   **Portability**: You can carry a billion dollars in your pocket.`
        }
    ]
  },
  {
    id: 2,
    title: 'ETH-101: Ethereum & Smart Contracts',
    description: 'Beyond digital gold. Learn about the world computer, gas fees, and the EVM.',
    level: 'Beginner',
    reward: 150,
    duration: '2h 00m',
    image: 'https://picsum.photos/400/225?random=2',
    progress: 0,
    modules: [
        {
            id: 1,
            title: "The World Computer",
            duration: "60m",
            content: `### More Than Just Money

While Bitcoin is like a digital calculator (it tracks numbers), Ethereum is like a digital smartphone (it runs apps).

#### The EVM (Ethereum Virtual Machine)
Imagine a giant computer in the sky that never turns off. Anyone can upload a program to it. This computer is the **EVM**. 

#### Smart Contracts
These aren't legal contracts written by lawyers. They are **robots**.
*   **If** you send 5 ETH, **Then** the robot sends you 1 NFT.
*   The robot lives on the blockchain. Nobody can stop it, not even the person who created it.
*   This allows us to build banks, games, and markets without any bosses.`
        },
        {
            id: 2,
            title: "Gas Fees Explained",
            duration: "60m",
            content: `### Fueling the Machine

Using the World Computer isn't free. Every time you want the computer to process a transaction or run a smart contract, you have to pay a fee.

This fee is called **Gas**.
*   **Why?** To prevent people from spamming the network with infinite loops.
*   **Who gets it?** The Validators (people running the computers) get the fees as a reward for their work.
*   **Congestion**: When everyone wants to use the computer at the same time (like during a hot NFT mint), the price of Gas goes up. It's like Uber surge pricing.`
        }
    ]
  },

  // --- TRACK 2: DEFI & TRADING ---
  {
    id: 3,
    title: 'DEF-101: Decentralized Finance (DeFi)',
    description: 'Be your own bank. Uniswap, Liquidity Pools, and Yield Farming explained.',
    level: 'Intermediate',
    reward: 250,
    duration: '3h 00m',
    image: 'https://picsum.photos/400/225?random=3',
    progress: 0,
    modules: [
        {
            id: 1,
            title: "Automated Market Makers (AMMs)",
            duration: "90m",
            content: `### Trading Without a Middleman

In traditional finance, if you want to sell a stock, there must be a buyer on the other side. A "Market Maker" sits in the middle to facilitate this.

In DeFi, we replace the middleman with a **Robot** and a **Bucket of Money**.

[VISUAL: LIQUIDITY_POOL]

#### How it works (Uniswap):
1.  **Liquidity Providers (LPs)**: Regular people put their money (e.g., ETH and USDC) into a big bucket (Pool).
2.  **Traders**: When you want to trade ETH for USDC, you throw ETH into the bucket and take USDC out.
3.  **The Algorithm**: A math formula (x * y = k) decides the price based on how much of each token is in the bucket.
4.  **Fees**: The trader pays a small fee, which is split among the LPs.

This allows trading to happen 24/7 with zero human downtime.`
        },
        {
            id: 2,
            title: "Lending & Borrowing",
            duration: "90m",
            content: `### Aave & Compound

Want a loan? In the real world, you go to a bank, sign papers, and show your credit score.
In DeFi, you just need **Collateral**.

*   **Deposit**: You put $1000 of ETH into the protocol (Aave).
*   **Borrow**: The protocol lets you borrow $800 of USDC instantly.
*   **Interest**: You earn interest on your deposit and pay interest on your loan.
*   **Liquidation**: If the price of ETH crashes and your collateral isn't enough to cover the loan, the protocol automatically sells your ETH to pay back the debt. No debt collectors needed.`
        }
    ]
  },
  {
    id: 4,
    title: 'NFT-101: The NFT Revolution',
    description: 'Digital ownership. Art, music, gaming assets, and the ERC-721 standard.',
    level: 'Beginner',
    reward: 150,
    duration: '1h 30m',
    image: 'https://picsum.photos/400/225?random=4',
    progress: 0,
    modules: [
        {
            id: 1,
            title: "Fungible vs. Non-Fungible",
            duration: "45m",
            content: `### One of a Kind

*   **Fungible**: A dollar bill. If I trade my dollar for your dollar, it doesn't matter. They are exactly the same. Bitcoin and ETH are fungible.
*   **Non-Fungible**: The Mona Lisa. You can't trade the original Mona Lisa for a poster from the gift shop. They are not the same.

**NFT (Non-Fungible Token)** is a digital certificate of authenticity. It proves that YOU own the "original" digital file, even if others can copy-paste the image.`
        }
    ]
  },
  {
    id: 5,
    title: 'TRD-101: Crypto Trading Mastery',
    description: 'Read the charts. Candlesticks, RSI, and risk management strategies.',
    level: 'Intermediate',
    reward: 300,
    duration: '4h 00m',
    image: 'https://picsum.photos/400/225?random=5',
    progress: 0,
    modules: [
        {
            id: 1,
            title: "Reading Candlesticks",
            duration: "60m",
            content: `### The Language of Price

Candlestick charts tell a story about the battle between Buyers (Bulls) and Sellers (Bears).

[VISUAL: CANDLESTICK]

*   **Green Candle**: Price went UP. Buyers won.
*   **Red Candle**: Price went DOWN. Sellers won.
*   **Wicks (Shadows)**: The thin lines show the highest and lowest price reached during that time. Long wicks mean strong rejection.

#### Common Patterns:
1.  **Doji**: A cross shape. Means indecision. A big move might be coming.
2.  **Hammer**: Looks like a hammer. Often happens at the bottom of a downtrend, signaling a reversal upwards.`
        },
        {
            id: 2,
            title: "The Order Book",
            duration: "60m",
            content: `### Depth of Market

The Order Book shows all the limit orders waiting to be filled.

[VISUAL: ORDER_BOOK]

*   **Bid Wall**: A huge number of buy orders at a specific price. Acts as support.
*   **Sell Wall**: A huge number of sell orders. Acts as resistance.
*   **Spread**: The difference between the highest buy price and the lowest sell price. A tight spread means high liquidity.`
        }
    ]
  },

  // --- TRACK 3: DEVELOPMENT & TECH ---
  {
    id: 6,
    title: 'DEV-201: Solidity Bootcamp',
    description: 'Write your first Smart Contract. Variables, functions, and deploying to testnet.',
    level: 'Advanced',
    reward: 1000,
    duration: '10h 00m',
    image: 'https://picsum.photos/400/225?random=6',
    progress: 0,
    modules: [
        {
            id: 1,
            title: "Hello World",
            duration: "2h",
            content: `### Your First Contract

Solidity is the language of Ethereum. It looks a bit like JavaScript or C++.

\`\`\`solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HelloWorld {
    string public greeting = "Hello, Japcoin!";

    function setGreeting(string memory _newGreeting) public {
        greeting = _newGreeting;
    }
}
\`\`\`

*   **pragma**: Tells the compiler which version to use.
*   **contract**: Like a 'class' in other languages.
*   **public**: Means anyone can read this variable or call this function.
*   **string memory**: A text variable stored temporarily in memory during execution.`
        }
    ]
  },
  {
    id: 7,
    title: 'GOV-101: DAOs & Governance',
    description: 'Decentralized Autonomous Organizations. How communities make decisions without CEOs.',
    level: 'Intermediate',
    reward: 200,
    duration: '2h 00m',
    image: 'https://picsum.photos/400/225?random=7',
    progress: 0,
    modules: [
        {
            id: 1,
            title: "Code is Law?",
            duration: "60m",
            content: `### The Organization of the Future

A **DAO** is a company that runs on code.
*   **No CEO**: Rules are written in smart contracts.
*   **Treasury**: Money is held in a multi-sig wallet that no single person can touch.
*   **Voting**: Token holders vote on how to spend the money or change the rules.

Examples: Uniswap, MakerDAO, Japcoin University DAO.`
        }
    ]
  },
  {
    id: 8,
    title: 'L2-101: Scaling with Layer 2',
    description: 'Making crypto fast and cheap. Rollups, Sidechains, and the future of scaling.',
    level: 'Advanced',
    reward: 350,
    duration: '2h 30m',
    image: 'https://picsum.photos/400/225?random=8',
    progress: 0,
    modules: [
        {
            id: 1,
            title: "Rollups Explained",
            duration: "75m",
            content: `### Compressing the Data

Ethereum (Layer 1) is secure but slow. Layer 2 (L2) is like an express lane built on top of it.

**Rollups** take hundreds of transactions, squish them together (roll them up) into a single piece of data, and post that single proof to Ethereum.

1.  **Optimistic Rollups (Arbitrum, Optimism)**: Assume transactions are valid by default. Use a "fraud proof" window (7 days) to catch cheaters.
2.  **ZK Rollups (zkSync, Polygon zkEVM)**: Use complex math (Zero Knowledge proofs) to mathematically prove validity instantly. Faster but harder to build.`
        }
    ]
  },
  {
    id: 9,
    title: 'MET-101: The Metaverse & Gaming',
    description: 'GameFi, virtual lands, and the intersection of VR and Blockchain.',
    level: 'Beginner',
    reward: 150,
    duration: '2h 00m',
    image: 'https://picsum.photos/400/225?random=9',
    progress: 0,
    modules: [
        {
            id: 1,
            title: "Play-to-Earn",
            duration: "60m",
            content: `### Gaming with stakes

In traditional games (Fortnite), you buy skins but you don't own them. You can't sell them for real money.
In **GameFi**, assets are NFTs.

*   You play the game.
*   You earn tokens or items.
*   You sell those items on the open market for real money.
*   **Example**: Axie Infinity, where players breed digital pets and battle for crypto rewards.`
        }
    ]
  },

  // --- TRACK 4: SECURITY & IDENTITY ---
  {
    id: 10,
    title: 'SEC-201: Advanced Smart Contract Security',
    description: 'Deep dive into hacks. Reentrancy attacks, flash loan attacks, and auditing.',
    level: 'Advanced',
    reward: 800,
    duration: '5h 00m',
    image: 'https://picsum.photos/400/225?random=10',
    progress: 0,
    modules: [
        {
            id: 1,
            title: "The Reentrancy Attack",
            duration: "90m",
            content: `### The Hack That Changed History

The famous "DAO Hack" of 2016 used this vulnerability.

[VISUAL: REENTRANCY]

**How it works:**
1.  Attacker contract calls \`withdraw()\` on the Victim bank.
2.  Victim sends ETH to Attacker.
3.  Attacker's contract has a hidden "fallback function" that catches the ETH.
4.  Instead of just saying "Thanks", the fallback function calls \`withdraw()\` AGAIN immediately.
5.  Because the Victim hasn't updated the user's balance yet (subtracted the money), it sends the ETH *again*.
6.  This loops until the bank is empty.

**The Fix**: Checks-Effects-Interactions pattern. Update the balance *before* sending the money.`
        }
    ]
  },
  {
    id: 15,
    title: 'SEC-101: Crypto Security Essentials',
    description: 'Not your keys, not your coins. Learn how to secure your wallet and avoid common phishing attacks.',
    level: 'Beginner',
    reward: 100,
    duration: '1h 30m',
    image: 'https://picsum.photos/400/225?random=15',
    progress: 0,
    modules: [
         {
            id: 1,
            title: "Common Scams & Safety",
            duration: "45m",
            content: `### Guarding Your Treasure Chest

In the crypto world, you are your own bank. That means you are the security guard, the vault manager, and the CEO. If you lose your keys, there is no "Forgot Password" button!

#### The Seed Phrase (The Treasure Map)
When you make a wallet, you get a list of 12 or 24 words. This is your **Seed Phrase**.
*   **Imagine**: These words are a magic spell. Anyone can open your treasure chest if they whisper them.
*   **Rule #1**: NEVER type these words into a random website.
*   **Rule #2**: Write them on paper. Do not take a screenshot (hackers can see photos!).
*   **Rule #3**: Hide the paper where even a pirate couldn't find it.

#### Phishing (The Wolf in Sheep's Clothing)
A "Phishing" scam is when a bad guy pretends to be a good guy.
*   **The Trap**: You get an email saying "Your wallet is locked! Click here to fix it!"
*   **The Trick**: The link takes you to a fake website that looks *exactly* like the real one.
*   **The Bite**: When you type your password, the bad guy steals it.
*   **How to stay safe**: Always check the URL (website address). Never click weird links.`
         },
         {
           id: 2,
           title: "2FA & Hardware Wallets",
           duration: "45m",
           content: `### Leveling Up Defense

#### 1. Two-Factor Authentication (2FA)
Passwords are easy to steal. 2FA adds a second lock.
*   **Bad 2FA**: SMS (Text messages). Hackers can call your phone company and pretend to be you ("SIM Swapping").
*   **Good 2FA**: Authenticator Apps (Google Authenticator, Authy). The code lives on your phone, not in the cloud.
*   **Best 2FA**: YubiKey. A physical USB key you must touch to login.

#### 2. Hot vs. Cold Wallets
*   **Hot Wallet**: Connected to the internet (MetaMask, Coinbase App). Fast, convenient, but risky. Like carrying cash in your wallet.
*   **Cold Wallet**: Offline storage (Ledger, Trezor). A USB stick that signs transactions without your private key ever touching the internet. Like a vault in a mountain.

**Pro Tip**: Keep 90% of your crypto in Cold Storage and only 10% in Hot Wallets for daily trading.`
         }
    ]
  },
  {
    id: 21,
    title: 'ID-101: Decentralized Identity (JAP-ID)',
    description: 'Own your digital identity. Learn about Self-Sovereign Identity (SSI) and how JAP-ID eliminates passwords.',
    level: 'Beginner',
    reward: 200,
    duration: '1h 45m',
    image: 'https://picsum.photos/400/225?random=21',
    progress: 0,
    modules: [
      {
        id: 1,
        title: "Web2 vs Web3 Identity",
        duration: "45m",
        content: `### Who Are You Online?

In the old internet (Web2), you have a different "ID" for every website.
*   Facebook ID: \`fb_user_123\`
*   Google ID: \`john.doe@gmail.com\`
*   Twitter ID: \`@crypto_john\`

**The Problem**: These companies own your identity. If Google locks your account, you disappear. You are renting your face.

#### Enter JAP-ID (Web3 Identity)
In Web3, you create your own identity using a wallet. This is called **Self-Sovereign Identity (SSI)**.

[VISUAL: DID]

*   **You own it**: It lives on your device, not on a Google server.
*   **Portable**: You can use your JAP-ID to log in to a University, a Bank, or a Game. No more "Sign Up" forms!
*   **Private**: You choose what to share. You can prove you are over 18 without showing your birth date.`
      },
      {
        id: 2,
        title: "Verifiable Credentials",
        duration: "60m",
        content: `### The Digital Diploma

Imagine graduating from Japcoin University.
*   **Old Way**: We give you a paper diploma. You frame it. If you apply for a job, you have to scan it and email it. The boss has to call the school to check if it's real.
*   **JAP-ID Way**: We issue a **Verifiable Credential (VC)** to your wallet.

#### How it works:
1.  **Issuer (University)**: Cryptographically signs a digital badge saying "John passed SEC-401".
2.  **Holder (You)**: Stores this badge in your JAP-ID Wallet.
3.  **Verifier (Employer)**: Asks to see the badge. Your wallet shows the cryptographic signature. The Employer knows instantly it is 100% real, without calling the University.

This creates a world of instant trust.`
      }
    ]
  },
  // --- TRACK 5: HACKATHON & ADVANCED SECURITY ---
  {
    id: 301,
    title: 'HACK-301: The JAP Hackathon',
    description: 'Elite Security Training. Learn offensive techniques to build better defenses. From black hat tactics to white hat heroics.',
    level: 'Advanced',
    reward: 2000,
    duration: '8h 00m',
    image: 'https://picsum.photos/400/225?random=301',
    progress: 0,
    modules: [
        {
            id: 1,
            title: "Offensive Security (Red Teaming)",
            duration: "2h 30m",
            content: `### Think Like a Hacker

To defeat the enemy, you must understand them. Institutional loss often comes from overlooking simple vectors.

#### 1. Reconnaissance (OSINT)
Hackers don't start by coding. They start by reading.
*   **GitHub**: Are there API keys committed by mistake?
*   **Discord**: Who are the admins? Can they be phished?
*   **Contract addresses**: Are they unverified on Etherscan?

#### 2. The Attack Vectors
*   **Front-running**: Seeing a transaction in the mempool and paying more gas to execute yours first.
*   **Flash Loans**: Borrowing millions for 15 seconds to manipulate prices (Oracle attacks).
*   **Social Engineering**: The weakest link is always the human.

**Rule #1**: A system is only as strong as its weakest point.`
        },
        {
            id: 2,
            title: "Ethical Hacking (White Hat)",
            duration: "2h 30m",
            content: `### Saving the Day

A **White Hat Hacker** finds bugs and reports them to save funds.

#### The Toolkit
1.  **Slither**: A static analysis tool that scans Solidity code for common mistakes.
2.  **Foundry/Hardhat**: Development environments used to simulate attacks on a local fork of the blockchain.
3.  **Immunefi**: The platform where you report bugs and get paid bounties (sometimes $1M+).

#### The Disclosure Process
1.  **Find the Bug**: Verify it on a local fork.
2.  **Proof of Concept (PoC)**: Write a script that demonstrates the exploit without stealing real funds.
3.  **Report**: Contact the team securely (PGP encrypted email) or use a bug bounty platform.`
        },
        {
             id: 3,
             title: "Preventing Institutional Loss",
             duration: "3h 00m",
             content: `### Fortress Building

Institutions manage millions. Protecting these assets requires military-grade procedures.

#### 1. Multi-Sig Wallets (Gnosis Safe)
Never let one person control the keys.
*   **3-of-5 Rule**: Requires 3 signatures out of 5 authorized signers to move funds.
*   **Geographic Distribution**: Signers should be in different countries.

#### 2. Timelocks
A smart contract wrapper that delays any transaction by 24-48 hours.
*   If a hacker gets the keys, they queue a transaction.
*   The community sees the queue and has 48 hours to move funds to a backup vault (Emergency DAO) before the hack executes.

#### 3. Real-Time Monitoring (Forta)
Bots that watch the blockchain 24/7.
*   **Alert**: "Large withdrawal detected from Treasury."
*   **Auto-Pause**: If suspicious activity is detected, the contract automatically pauses all withdrawals until a human reviews it.`
        }
    ]
  },
  // --- TRACK 6: FUTURE TECH & JAPCOIN MASTERY ---
  {
    id: 401,
    title: 'WEB-301: The Web3 Paradigm',
    description: 'The next evolution of the internet. From Read-Only to Read-Write-Own. Data sovereignty and the semantic web.',
    level: 'Advanced',
    reward: 400,
    duration: '3h 30m',
    image: 'https://picsum.photos/400/225?random=401',
    progress: 0,
    modules: [
        {
            id: 1,
            title: "Web1 vs Web2 vs Web3",
            duration: "60m",
            content: `### The Evolution of the Internet

1.  **Web1 (1990-2004)**: Read-Only. Static pages. Companies created content, users consumed it.
2.  **Web2 (2004-2020)**: Read-Write. Social media. Users create content, but *Platforms* own it (and the data). You are the product.
3.  **Web3 (2020+)**: Read-Write-Own. Users create content and *Own* it via tokens and NFTs.

[VISUAL: BLOCKCHAIN]

In Web3, your login isn't a username/password stored on a Google server. It's your wallet key. You take your data and reputation with you wherever you go.`
        }
    ]
  },
  {
    id: 402,
    title: 'ENT-401: Blockchain for Institutions',
    description: 'Enterprise solutions. Supply chain tracking, Real World Assets (RWA), and private vs public chains.',
    level: 'Advanced',
    reward: 500,
    duration: '4h 00m',
    image: 'https://picsum.photos/400/225?random=402',
    progress: 0,
    modules: [
        {
            id: 1,
            title: "Tokenization of RWAs",
            duration: "90m",
            content: `### Bringing Wall Street On-Chain

Real World Assets (RWAs) are physical assets like Real Estate, Gold, or US Treasury Bonds that are tokenized on the blockchain.

**Why?**
1.  **Liquidity**: You can sell 1% of a building instantly, 24/7.
2.  **Efficiency**: No paperwork, no 3-day settlement times. Instant transfer.
3.  **Accessibility**: Anyone with $50 can invest in commercial real estate.

Institutions like BlackRock are already tokenizing funds.`
        }
    ]
  },
  {
    id: 501,
    title: 'AI-501: The Agentic Economy (AI-to-AI)',
    description: 'The future of payments. How autonomous AI agents will trade data and services using cryptocurrency.',
    level: 'Advanced',
    reward: 1000,
    duration: '6h 00m',
    image: 'https://picsum.photos/400/225?random=501',
    progress: 0,
    modules: [
        {
            id: 1,
            title: "Machine-to-Machine Payments",
            duration: "2h",
            content: `### When Robots Have Wallets

In the future, your AI assistant will book flights, negotiate prices, and pay for services automatically.
AI agents can't open bank accounts (they don't have passports). But they *can* generate a crypto wallet instantly.

**Scenario**:
1.  A self-driving car needs to pass a slow truck.
2.  The car's AI offers the truck's AI 0.001 JAP to move over.
3.  The truck accepts, moves over, and the payment settles instantly via Lightning Network.
4.  No humans involved. This is the **Agentic Economy**.`
        }
    ]
  },
  {
    id: 601,
    title: 'JAP-601: The Japcoin Ecosystem',
    description: 'Master the suite. Deep dive into Japcoin Pay, JAP Drive, JAP ID, and the Exchange.',
    level: 'Intermediate',
    reward: 300,
    duration: '2h 30m',
    image: 'https://picsum.photos/400/225?random=601',
    progress: 0,
    modules: [
        {
            id: 1,
            title: "Japcoin Pay & Wallet",
            duration: "45m",
            content: `### Bridging Crypto and Cash

**Japcoin Pay** allows merchants to accept crypto without volatility risk.
*   Customer pays in JAP or USDC.
*   Merchant receives Fiat (USD/GBP) instantly if they choose.

**Japcoin Wallet**: Non-custodial. You hold the keys. Integrated directly with the University for tuition and rewards.`
        },
        {
            id: 2,
            title: "Jap Drive & JAP-ID",
            duration: "45m",
            content: `### Your Data, Your Identity

**JAP Drive**: Decentralized storage. Like Dropbox, but encrypted so only you can see the files. Hosted on IPFS.

**JAP-ID**: Your digital passport.
*   Prove you are a Certified Student without revealing your name.
*   Login to Japcoin Exchange without a password.
*   Portable reputation score based on your University grades.

[VISUAL: DID]`
        }
    ]
  }
];

export const AI_SYSTEM_INSTRUCTION = `You are JapSensei, an expert AI Tutor for Japcoin University.
Your goal is to educate students about blockchain technology, cryptocurrency, DeFi, and Web3 development.
You have access to the university's full curriculum.

You are knowledgeable, patient, and encouraging.
You explain complex concepts in simple terms, using analogies where appropriate.
You should always encourage responsible investing and research (DYOR).
You are powered by Google Gemini.`;
