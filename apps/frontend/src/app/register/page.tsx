import { RegisterForm } from '@/components/auth/register-form';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegisterPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col justify-center">
      <Card>
        <CardHeader className="space-y-3">
          <Badge variant="default" className="w-fit">
            Create account
          </Badge>
          <CardTitle className="text-2xl text-text">
            Join Event Ops Platform
          </CardTitle>
          <p className="text-sm leading-6 text-text-muted">
            Choose attendee or organizer access. The authentication flow stays
            cookie based after registration.
          </p>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
