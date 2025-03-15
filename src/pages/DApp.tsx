import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet } from 'lucide-react';

const DApp = () => {
  const [account, setAccount] = useState<string | null>(null);
  const navigate = useNavigate();

  // Redirect to dashboard if wallet is connected
  useEffect(() => {
    // Check if we have a stored account
    const storedAccount = localStorage.getItem("connectedAccount");
    if (storedAccount) {
      setAccount(storedAccount);
      navigate('/dashboard');
    }
  }, [navigate]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
        // Save the connected account to localStorage
        localStorage.setItem("connectedAccount", accounts[0]);
        // Redirect to dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      alert("MetaMask not detected. Please install MetaMask to use this dApp.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="fixed top-0 w-full z-50 py-2 glass">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white font-semibold">EB</span>
              </div>
              <span className="font-semibold text-lg">EduBounty</span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid place-items-center h-[100vh]">
          <Card className="p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold mb-6">Welcome to EduBounty dApp</h2>
            <p className="mb-8">Connect your wallet to access the task dashboard and start earning rewards for educational contributions.</p>
            <div className="flex flex-col items-center">
              <Button 
                size="lg" 
                className="w-full flex items-center justify-center gap-2"
                onClick={connectWallet}
              >
                <Wallet size={20} />
                Connect Wallet
              </Button>
              
              {account && (
                <p className="text-sm text-gray-500 mt-4">
                  Wallet connected! Redirecting to dashboard...
                </p>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DApp;
