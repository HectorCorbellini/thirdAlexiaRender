import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CreateBusinessForm } from "./CreateBusinessForm";
import { EditBusinessForm } from "./EditBusinessForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Building2, 
  MapPin, 
  Phone, 
  Star, 
  ExternalLink, 
  Edit, 
  Trash2,
  Plus,
  Search,
  Filter,
  Loader2
} from "lucide-react"
import { businessAPI } from "@/services/api"
import { toast } from "sonner"

export function BusinessList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (businessId: string) => businessAPI.delete(businessId),
    onSuccess: () => {
      toast.success("Business deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to delete business.");
    },
  });

  const { data: businesses = [], isPending: isLoading, error } = useQuery<any[], Error>({
    queryKey: ['businesses'],
    queryFn: async () => {
      try {
        const response = await businessAPI.getAll();
        return response.data;
      } catch (err: any) {
        toast.error(err.response?.data?.error || 'Failed to load businesses');
        throw err;
      }
    }
  });

  const filteredBusinesses = businesses.filter((business: any) =>
    business.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-500">Failed to load businesses</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Dialog open={!!selectedBusiness} onOpenChange={(isOpen) => !isOpen && setSelectedBusiness(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Business</DialogTitle>
          </DialogHeader>
          {selectedBusiness && <EditBusinessForm setOpen={(isOpen) => !isOpen && setSelectedBusiness(null)} business={selectedBusiness} />}
        </DialogContent>
      </Dialog>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Businesses</h2>
          <p className="text-muted-foreground">Manage registered businesses and their information</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Add Business
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Business</DialogTitle>
            </DialogHeader>
            <CreateBusinessForm setOpen={setCreateModalOpen} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search businesses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Businesses</CardDescription>
            <CardTitle className="text-2xl">{businesses.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-2xl text-success">
              {businesses.filter((b: any) => b.isActive).length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-2xl text-primary">
              {businesses.reduce((acc: number, b: any) => acc + (b._count?.users || 0), 0)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Leads</CardDescription>
            <CardTitle className="text-2xl text-warning">
              {businesses.reduce((acc: number, b: any) => acc + (b._count?.leads || 0), 0)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Business List */}
      <div className="grid gap-4">
        {filteredBusinesses.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No businesses found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search' : 'Get started by adding your first business'}
              </p>
              <Button className="bg-gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Business
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredBusinesses.map((business: any) => (
            <Card key={business.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{business.name}</h3>
                          {business.isActive && (
                            <Badge variant="default">Active</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          {business.category && (
                            <span>{business.category}</span>
                          )}
                          {business._count && (
                            <>
                              <span>•</span>
                              <span>{business._count.users} users</span>
                              <span>•</span>
                              <span>{business._count.leads} leads</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {business.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {business.description}
                      </p>
                    )}

                    {business.location && (
                      <div className="flex items-center text-sm mt-2">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        Location data available
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedBusiness(business)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the business and all its associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(business.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}