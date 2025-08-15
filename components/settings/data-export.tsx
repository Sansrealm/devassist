"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, FileText, Database, Loader2 } from "lucide-react"
import { exportUserData } from "@/lib/settings/actions"

export default function DataExport() {
  const [selectedData, setSelectedData] = useState({
    profile: true,
    emails: true,
    projects: true,
    tools: true,
    subscriptions: true,
    mappings: true,
    activity: false,
  })
  const [isPending, startTransition] = useTransition()

  const handleExport = () => {
    startTransition(async () => {
      const result = await exportUserData(selectedData)
      if (result.success && result.data) {
        // Create and download the JSON file
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `devstack-companion-export-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    })
  }

  const handleSelectAll = () => {
    const allSelected = Object.values(selectedData).every(Boolean)
    const newState = Object.keys(selectedData).reduce(
      (acc, key) => ({
        ...acc,
        [key]: !allSelected,
      }),
      {},
    )
    setSelectedData(newState as typeof selectedData)
  }

  const dataTypes = [
    {
      key: "profile" as keyof typeof selectedData,
      label: "Profile Information",
      description: "Name, avatar, timezone, and account details",
    },
    {
      key: "emails" as keyof typeof selectedData,
      label: "Email Addresses",
      description: "All registered email addresses and verification status",
    },
    {
      key: "projects" as keyof typeof selectedData,
      label: "Projects",
      description: "Project names, descriptions, status, and notes",
    },
    {
      key: "tools" as keyof typeof selectedData,
      label: "Tools",
      description: "Tool information, categories, and configurations",
    },
    {
      key: "subscriptions" as keyof typeof selectedData,
      label: "Subscriptions",
      description: "Subscription details, costs, and billing information",
    },
    {
      key: "mappings" as keyof typeof selectedData,
      label: "Project-Tool Mappings",
      description: "Relationships between projects and tools",
    },
    {
      key: "activity" as keyof typeof selectedData,
      label: "Activity Log",
      description: "Account activity and change history",
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="border-2 border-transparent bg-gradient-to-r from-[#002F71] to-[#0A4BA0] p-[2px]">
        <div className="bg-background rounded-[calc(var(--radius)-2px)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Your Data
            </CardTitle>
            <CardDescription>Download a copy of your DevStack Companion data in JSON format</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Select Data to Export</Label>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  {Object.values(selectedData).every(Boolean) ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <div className="space-y-4">
                {dataTypes.map((dataType) => (
                  <div key={dataType.key} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={dataType.key}
                      checked={selectedData[dataType.key]}
                      onCheckedChange={(checked) =>
                        setSelectedData((prev) => ({
                          ...prev,
                          [dataType.key]: checked === true,
                        }))
                      }
                    />
                    <div className="flex-1">
                      <Label htmlFor={dataType.key} className="font-medium cursor-pointer">
                        {dataType.label}
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">{dataType.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleExport}
                disabled={!Object.values(selectedData).some(Boolean) || isPending}
                className="bg-gradient-to-r from-[#002F71] to-[#0A4BA0] hover:from-[#001f4d] hover:to-[#083d87]"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start space-x-2">
            <Database className="h-4 w-4 text-blue-600 mt-0.5" />
            <p>Exported data is in JSON format and includes all selected information from your account.</p>
          </div>
          <div className="flex items-start space-x-2">
            <FileText className="h-4 w-4 text-green-600 mt-0.5" />
            <p>The export file is generated in real-time and reflects your current data.</p>
          </div>
          <div className="flex items-start space-x-2">
            <Download className="h-4 w-4 text-purple-600 mt-0.5" />
            <p>Files are downloaded directly to your device and not stored on our servers.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
