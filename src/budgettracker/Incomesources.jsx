import React, { useState, useContext, useEffect } from "react";
import CardDetails from "./CardDetails";
import WalletDetails from "./WalletDetails";
import AddDetailsModal from "./modals/AddDetailsModal";
import AddCardDetailsModal from "./modals/AddCardDetailsModal";
import { UserContext } from "../context/UserContext";
import { db } from "../config/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const IncomeSources = () => {
  const { user } = useContext(UserContext);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [cardDetails, setCardDetails] = useState(null);
  const [walletDetails, setWalletDetails] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchDetails = async () => {
        const cardDoc = await getDoc(doc(db, "cardDetails", user.uid));
        const walletDoc = await getDoc(doc(db, "walletDetails", user.uid));
        if (cardDoc.exists()) {
          setCardDetails(cardDoc.data());
        }
        if (walletDoc.exists()) {
          setWalletDetails(walletDoc.data());
        }
      };
      fetchDetails();
    }
  }, [user]);

  const handleAddCardDetails = async (details) => {
    await setDoc(doc(db, "cardDetails", user.uid), details);
    setCardDetails(details);
  };

  const handleAddWalletDetails = async (details) => {
    await setDoc(doc(db, "walletDetails", user.uid), details);
    setWalletDetails(details);
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="p-4 text-2xl font-semibold text-blaze-orange-400">
            My Card
          </h2>
          <CardDetails
            balance={cardDetails?.balance || "0.00"}
            cardHolder={cardDetails?.cardHolder || user.displayName}
            validThru={cardDetails?.validThru || "12/23"}
            cardNumber={cardDetails?.cardNumber || "**** **** **** 1234"}
            onSetDetails={() => setIsCardModalOpen(true)}
            isDetailsSet={!!cardDetails}
          />
        </div>
        <div>
          <h2 className="text-2xl mx-2 font-semibold text-blaze-orange-400">
            My Wallet
          </h2>
          <WalletDetails
            name={user.displayName}
            balance={walletDetails?.balance || "0.00"}
            onSetDetails={() => setIsWalletModalOpen(true)}
            isDetailsSet={!!walletDetails}
          />
        </div>
      </div>
      <AddCardDetailsModal
        open={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        onSave={handleAddCardDetails}
      />
      <AddDetailsModal
        open={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onSave={handleAddWalletDetails}
      />
    </div>
  );
};

export default IncomeSources;
