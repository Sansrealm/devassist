"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Mail, Shield, Trash2, Star, CheckCircle, AlertCircle } from "lucide-react"
import { addEmail, setPrimaryEmail, deleteEmail, resendVerification } from "@/lib/settings/actions"

interface Email {
  id: string
  email: string
  isPrimary: boolean
  isVerified: boolean
  createdAt: Date
}

interface EmailSettingsProps {
  emails: Email[]
}

export default function EmailSettings({ emails }: EmailSettingsProps) {
  const [newEmail, setNewEmail] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleAddEmail = () => {
    if (!newEmail.trim()) return

    startTransition(async () => {
      await addEmail(newEmail)
      setNewEmail("")
    })
  }

  const handleSetPrimary = (emailId: string) => {
    startTransition(async () => {
      await setPrimaryEmail(emailId)
    })
  }

  const handleDeleteEmail = (emailId: string) => {
    startTransition(async () => {
      await deleteEmail(emailId)
    })
  }

  const handleResendVerification = (emailId: string) => {
    startTransition(async () => {
      await resendVerification(emailId)
    })
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date))
  }

  return (
    <div className="space-y-6">
      {/* Add New Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Email Address
          </CardTitle>
          <CardDescription>Add additional email addresses to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="newEmail" className="sr-only">
                Email address
              </Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="new-email@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
              />
            </div>
            <Button
              onClick={handleAddEmail}
              disabled={!newEmail.trim() || isPending}
              className="bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Email
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">A verification email will be sent to the new address.</p>
        </CardContent>
      </Card>

      {/* Email List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Addresses ({emails.length})
          </CardTitle>
          <CardDescription>Manage your email addresses and verification status</CardDescription>
        </CardHeader>
        <CardContent>
          {emails.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No email addresses found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emails.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{email.email}</span>
                          {email.isPrimary && (
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {email.isVerified ? (
                            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Unverified
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(email.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!email.isPrimary && email.isVerified && (
                              <DropdownMenuItem onClick={() => handleSetPrimary(email.id)}>
                                <Star className="mr-2 h-4 w-4" />
                                Set as Primary
                              </DropdownMenuItem>
                            )}
                            {!email.isVerified && (
                              <DropdownMenuItem onClick={() => handleResendVerification(email.id)}>
                                <Mail className="mr-2 h-4 w-4" />
                                Resend Verification
                              </DropdownMenuItem>
                            )}
                            {!email.isPrimary && (
                              <DropdownMenuItem
                                onClick={() => handleDeleteEmail(email.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Email Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <p>Your primary email is used for important account notifications and password resets.</p>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <p>All email addresses must be verified before they can be set as primary.</p>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            <p>You can associate different tools with different email addresses for better organization.</p>
          </div>
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <p>Deleting an email address will also remove all associated tool accounts.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
