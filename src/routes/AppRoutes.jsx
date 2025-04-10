import { Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "../components/Auth/LoginForm";
import SignUpForm from "../components/Auth/SignUpForm";
import DashBoard from "../budgettracker/dashboard";
import Transactions from "../budgettracker/Transactions";
import Reports from "../budgettracker/Reports";
import Income from "../budgettracker/Incomesources";
import Settings from "../budgettracker/Settings";
import SavingsGoals from "../budgettracker/SavingsGoals";
import BudgetLimits from "../budgettracker/BudgetLimits";
import PrivateRoute from "./PrivateRoute";
import MainLayout from "../components/Layout/MainLayout";
import AuthLayout from "../components/Layout/AuthLayout";
import { useAuth } from "../hooks/useAuth";

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/auth/*" element={<AuthLayout />}>
        <Route index element={<LoginForm />} />
        <Route path="sign-up" element={<SignUpForm />} />
      </Route>
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashBoard />} />
        <Route path="dashboard" element={<DashBoard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="reports" element={<Reports />} />
        <Route path="income" element={<Income />} />
        <Route path="settings" element={<Settings />} />
        <Route path="savings-goals" element={<SavingsGoals />} />
        <Route path="budget-limits" element={<BudgetLimits />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/auth"} />}
      />
    </Routes>
  );
};

export default AppRoutes;
