import { useState, useEffect } from "react";
import TablePagination, { usePagination } from "@/components/admin/TablePagination";
import BulkActionsBar from "@/components/admin/BulkActionsBar";
import ConfirmDialog from "@/components/admin/ConfirmDialog";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Package, Eye, Trash2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Listing {
  id: string;
  title: string;
  price: number;
  category: string;
  status: string;
  user_id: string;
  created_at: string;
  condition: string;
}

const AdminListingsManagement = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "sold" | "removed">("all");
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmBulkRemove, setConfirmBulkRemove] = useState(false);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchListings = async () => {
    setLoading(true);
    let query = supabase.from("listings").select("id, title, price, category, status, user_id, created_at, condition").order("created_at", { ascending: false });
    if (statusFilter !== "all") query = query.eq("status", statusFilter);
    const { data } = await query;
    setListings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchListings(); }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("listings").update({ status: newStatus }).eq("id", id);
    if (error) { toast.error("Failed to update listing"); } else {
      toast.success(`Listing ${newStatus}`);
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l)));
      setSelectedListing(null);
    }
  };

  const handleBulkRemove = async () => {
    setProcessing(true);
    const ids = [...selected];
    await (supabase as any).from("listings").update({ status: "removed" }).in("id", ids);
    toast.success(`${ids.length} listing(s) removed`);
    setSelected(new Set()); setConfirmBulkRemove(false); setProcessing(false); fetchListings();
  };

  const handleBulkDelete = async () => {
    setProcessing(true);
    const ids = [...selected];
    await (supabase as any).from("listings").delete().in("id", ids);
    toast.success(`${ids.length} listing(s) deleted`);
    setSelected(new Set()); setConfirmBulkDelete(false); setProcessing(false); fetchListings();
  };

  const filteredListings = listings.filter((l) => !search || l.title.toLowerCase().includes(search.toLowerCase()));
  const pagination = usePagination(filteredListings, 15);

  const toggleSelect = (id: string) => { setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); };
  const toggleAll = () => { if (selected.size === filteredListings.length) setSelected(new Set()); else setSelected(new Set(filteredListings.map((l) => l.id))); };

  const statusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Active</Badge>;
      case "sold": return <Badge variant="secondary">Sold</Badge>;
      case "removed": return <Badge variant="destructive">Removed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const activeCount = listings.filter((l) => l.status === "active").length;
  const removedCount = listings.filter((l) => l.status === "removed").length;

  return (
    <>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="cursor-pointer" onClick={() => setStatusFilter("all")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Package className="w-5 h-5 text-primary" /></div>
              <div><p className="text-2xl font-bold text-foreground">{listings.length}</p><p className="text-xs text-muted-foreground">Total Listings</p></div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => setStatusFilter("active")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Eye className="w-5 h-5 text-emerald-600" /></div>
              <div><p className="text-2xl font-bold text-foreground">{activeCount}</p><p className="text-xs text-muted-foreground">Active</p></div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => setStatusFilter("removed")}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center"><Trash2 className="w-5 h-5 text-destructive" /></div>
              <div><p className="text-2xl font-bold text-foreground">{removedCount}</p><p className="text-xs text-muted-foreground">Removed</p></div>
            </CardContent>
          </Card>
        </div>

        <BulkActionsBar
          selectedCount={selected.size}
          totalCount={filteredListings.length}
          onSelectAll={toggleAll}
          onClearSelection={() => setSelected(new Set())}
          allSelected={selected.size === filteredListings.length && filteredListings.length > 0}
          actions={[
            { label: "Remove", onClick: () => setConfirmBulkRemove(true), variant: "outline", icon: <Trash2 className="w-3.5 h-3.5 mr-1" /> },
            { label: "Delete", onClick: () => setConfirmBulkDelete(true), variant: "destructive", icon: <Trash2 className="w-3.5 h-3.5 mr-1" /> },
          ]}
        />

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {statusFilter === "all" ? "All Listings" : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Listings`}
              </CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search listings..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-medium">No listings found</p>
              </div>
            ) : (
              <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><Checkbox checked={selected.size === filteredListings.length && filteredListings.length > 0} onCheckedChange={toggleAll} /></TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagination.paginatedItems.map((listing) => (
                    <TableRow key={listing.id} className={selected.has(listing.id) ? "bg-primary/5" : ""}>
                      <TableCell><Checkbox checked={selected.has(listing.id)} onCheckedChange={() => toggleSelect(listing.id)} /></TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">{listing.title}</TableCell>
                      <TableCell>${listing.price}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{listing.category}</TableCell>
                      <TableCell>{statusBadge(listing.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(listing.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setSelectedListing(listing)}>Manage</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination {...pagination} onPageChange={pagination.setCurrentPage} />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedListing} onOpenChange={(o) => !o && setSelectedListing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Manage Listing</DialogTitle></DialogHeader>
          {selectedListing && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">{selectedListing.title}</p>
                <div className="flex gap-3 text-sm text-muted-foreground">
                  <span>Price: <span className="text-foreground font-medium">${selectedListing.price}</span></span>
                  <span>Category: <span className="text-foreground">{selectedListing.category}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  {statusBadge(selectedListing.status)}
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                {selectedListing.status !== "removed" && (
                  <Button variant="destructive" size="sm" onClick={() => handleUpdateStatus(selectedListing.id, "removed")}>
                    <Trash2 className="w-4 h-4 mr-1" /> Remove
                  </Button>
                )}
                {selectedListing.status === "removed" && (
                  <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(selectedListing.id, "active")}>
                    <RotateCcw className="w-4 h-4 mr-1" /> Restore
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => window.open(`/listing/${selectedListing.id}`, "_blank")}>
                  <Eye className="w-4 h-4 mr-1" /> View
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirmBulkRemove} onOpenChange={setConfirmBulkRemove} title="Remove Selected Listings" description={`Mark ${selected.size} listing(s) as removed?`} confirmLabel={`Remove ${selected.size}`} onConfirm={handleBulkRemove} loading={processing} />
      <ConfirmDialog open={confirmBulkDelete} onOpenChange={setConfirmBulkDelete} title="Delete Selected Listings" description={`Permanently delete ${selected.size} listing(s)? This cannot be undone.`} confirmLabel={`Delete ${selected.size}`} onConfirm={handleBulkDelete} loading={processing} />
    </>
  );
};

export default AdminListingsManagement;
