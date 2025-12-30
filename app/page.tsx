import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default async function HomePage() {
  const hasEnvVars = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!hasEnvVars) {
    // Show setup instructions if environment variables are missing
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-amber-500" />
              <CardTitle>Setup Required</CardTitle>
            </div>
            <CardDescription>Supabase environment variables need to be configured</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-2">Missing Environment Variables</h3>
              <p className="text-sm text-amber-800 mb-3">
                The following environment variables are required but not configured:
              </p>
              <ul className="list-disc list-inside text-sm text-amber-800 space-y-1 ml-2">
                <li>
                  <code className="bg-amber-100 px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code>
                </li>
                <li>
                  <code className="bg-amber-100 px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold">Setup Instructions:</h3>

              <div className="space-y-2">
                <p className="text-sm font-medium">Step 1: Get Your Supabase Credentials</p>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-2">
                  <li>
                    Go to{" "}
                    <a
                      href="https://supabase.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      supabase.com/dashboard
                    </a>
                  </li>
                  <li>Select your project</li>
                  <li>Go to Settings → API</li>
                  <li>
                    Copy the <strong>Project URL</strong> and <strong>anon/public key</strong>
                  </li>
                </ol>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Step 2: Add Variables in v0</p>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 ml-2">
                  <li>
                    Open the <strong>Vars</strong> section in the left sidebar
                  </li>
                  <li>
                    Add <code className="bg-muted px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_SUPABASE_URL</code> with
                    your Project URL
                  </li>
                  <li>
                    Add <code className="bg-muted px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
                    with your anon key
                  </li>
                  <li>Save and refresh the preview</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  } else {
    redirect("/protected")
  }
}
