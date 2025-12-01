import { cn } from "~/lib/utils"
import { Button } from "./button"
import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "~/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "./field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select"
import { Input } from "./input"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState<'patient' | 'medecin' | 'admin'>('patient');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);

    try {
      console.log(name, email, password, passwordConfirmation, role);
      
      await register(name, email, password, passwordConfirmation, role);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle  className="text-xl text-blue-700">Create your account</CardTitle>
          <CardDescription>
            Enter your email below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name" className="text-blue-700">Full Name</FieldLabel>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} type="text" placeholder="John Doe" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="email" className="text-blue-700">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  disabled={isLoading}
                  required
                />
              </Field>
              <Field>
                <FieldLabel className="text-blue-700">Role</FieldLabel>
                <Select value={role} onValueChange={(value) => setRole(value as 'patient' | 'medecin' | 'admin')} disabled={isLoading}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue id="role" placeholder="Select your role"/>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Role</SelectLabel>
                      <SelectItem value="patient">patient</SelectItem>
                      <SelectItem value="medecin">medecin</SelectItem>
                      <SelectItem value="admin">admin</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <Field className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="password" className="text-blue-700">Password</FieldLabel>
                    <Input id="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} type="password" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirm-password" className="text-blue-700">
                      Confirm Password
                    </FieldLabel>
                    <Input id="confirm-password" type="password" value={passwordConfirmation} onChange={(e) => setPasswordConfirmation(e.target.value)} disabled={isLoading} required />
                  </Field>
                </Field>
                <FieldDescription>
                  Must be at least 8 characters long.
                </FieldDescription>
              </Field>
              <Field>
                <Button type="submit" className="text-white bg-blue-600 hover:bg-blue-700">Create Account</Button>
                <FieldDescription className="text-center">
                  Already have an account? <a href="#">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
