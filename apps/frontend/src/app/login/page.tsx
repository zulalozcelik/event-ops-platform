import { LoginForm } from '@/components/auth/login-form';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col justify-center">
      <Card>
        <CardHeader className="space-y-3">
          <Badge variant="default" className="w-fit">
            Welcome back
          </Badge>
          <CardTitle className="text-2xl text-text">Sign in</CardTitle>
          <p className="text-sm leading-6 text-text-muted">
            Continue to your event workspace and notification center.
          </p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
