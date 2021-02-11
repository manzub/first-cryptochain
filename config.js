// contains all configuration variables needed by the application

// used to calculate dynamic difficulty for our application
const MINE_RATE = 1000
const INITIAL_DIFFICULTY = 3
// static data for our geneis block
const GENESIS_DATA = {
    timestamp: 1,
    lastHash: '-----',
    hash: 'f157-h45h',
    difficulty: INITIAL_DIFFICULTY,
    nonce: 0,
    data: []
};
// initial balance to reward new peers on our application
const STARTING_BALANCE = 1000
const REWARD_INPUT = { address: '*authorized-reward*' }
const MINING_REWARD = 50;

module.exports = { 
    GENESIS_DATA, 
    INITIAL_DIFFICULTY, 
    MINE_RATE, 
    STARTING_BALANCE, 
    REWARD_INPUT, 
    MINING_REWARD 
}