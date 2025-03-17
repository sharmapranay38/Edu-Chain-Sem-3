// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract TaskManager is ReentrancyGuard {
    struct Task {
        uint256 id;
        string title;
        string description;
        uint256 reward;
        address creator;
        address completer;
        bool isCompleted;
    }

    IERC20 public eduToken;
    uint256 public taskCounter;
    mapping(uint256 => Task) public tasks;

    event TaskCreated(uint256 indexed taskId, address indexed creator, uint256 reward);
    event TaskCompleted(uint256 indexed taskId, address indexed completer, uint256 reward);

    constructor(address _eduTokenAddress) {
        eduToken = IERC20(_eduTokenAddress);
        taskCounter = 0;
    }

    function createTask(string memory title, string memory description, uint256 reward) external {
        taskCounter++;
        tasks[taskCounter] = Task({
            id: taskCounter,
            title: title,
            description: description,
            reward: reward,
            creator: msg.sender,
            completer: address(0),
            isCompleted: false
        });

        emit TaskCreated(taskCounter, msg.sender, reward);
    }

    function completeTask(uint256 taskId) external nonReentrant {
        Task storage task = tasks[taskId];
        require(!task.isCompleted, "Task already completed");
        require(eduToken.transferFrom(task.creator, msg.sender, task.reward), "Payment failed");

        task.completer = msg.sender;
        task.isCompleted = true;

        emit TaskCompleted(taskId, msg.sender, task.reward);
    }
}