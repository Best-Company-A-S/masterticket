import TicketSearchBar from "@/components/tickets/ticket-search-bar";
import { Button } from "@/components/ui/button";

const TicketsPage = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start gap-2">
          <h1 className="text-4xl font-bold">Tickets</h1>
          <p className="text-sm text-gray-500">
            Manage and track all incoming support request from internal teams.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-2">
          {/* TODO: ADD DIALOG FOR CREATE TICKET */}
          <Button>Create Ticket</Button>
        </div>
      </div>

      <div className="mt-5">
        <TicketSearchBar />
      </div>
      <div className="mt-5">{/*  <TicketFilters /> */}</div>
    </div>
  );
};

export default TicketsPage;
