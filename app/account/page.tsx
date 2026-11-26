import { AccountPage } from "@/src/components/account/account-page";

export const metadata = {
  title: "My Account | Euresis",
  description: "Manage your Euresis profile, vehicle garage, enquiries and orders.",
};

export default function CustomerAccountRoute() {
  return <AccountPage />;
}
