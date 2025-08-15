import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Shield, Key, Mail, AlertTriangle } from "lucide-react"

interface SecuritySettingsProps {
  user: {
    id: string
    email?: string
    user_metadata?: {
      avatar_url?: string
      full_name?: string
    }
  }
}

export default function SecuritySettings({ user }: SecuritySettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Authentication Method
          </CardTitle>
          <CardDescription>Your current authentication setup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium">Magic Link Authentication</h4>
                <p className="text-sm text-muted-foreground">Sign in using email magic links</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              Active
            </Badge>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <Key className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-600">Passwordless Security</p>
                <p className="text-blue-600/80 mt-1">
                  Your account uses magic link authentication for enhanced security. No passwords to remember or manage.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Account Security
          </CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Account ID</h4>
                <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Primary Email</h4>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-3">Security Actions</h4>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <Mail className="mr-2 h-4 w-4" />
                Request New Magic Link
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-destructive hover:text-destructive bg-transparent"
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Delete Account
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <Shield className="h-4 w-4 text-green-600 mt-0.5" />
            <p>Always sign in from trusted devices and networks.</p>
          </div>
          <div className="flex items-start space-x-2">
            <Mail className="h-4 w-4 text-blue-600 mt-0.5" />
            <p>Keep your email account secure as it's used for authentication.</p>
          </div>
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <p>Never share magic links with others or click suspicious links.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
