// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PaymentHandler is ReentrancyGuard {
    IERC20 public eduToken;

    event PaymentProcessed(address indexed payer, address indexed payee, uint256 amount);

    constructor(address _eduTokenAddress) {
        eduToken = IERC20(_eduTokenAddress);
    }

    function payUser(address payee, uint256 amount) external nonReentrant {
        require(eduToken.transferFrom(msg.sender, payee, amount), "Payment failed");
        emit PaymentProcessed(msg.sender, payee, amount);
    }
}