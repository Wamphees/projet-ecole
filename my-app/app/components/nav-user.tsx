"use client";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface NavUserProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  } | null; // <- si user peut être null avant auth
}

export function NavUser({ user }: NavUserProps) {
  const name = user?.name ?? "Utilisateur";
  const email = user?.email ?? "email inconnu";
  const avatar = user?.avatar ?? undefined;

  const initials = name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className=" bg-linear-to-r from-blue-600 to-purple-700 rounded-lg cursor-pointer">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 w-full p-2 rounded-lg cursor-pointer">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>

            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{name}</span>
              <span className="truncate text-xs">{email}</span>
            </div>

            <ChevronsUpDown className="ml-auto size-4" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="min-w-56 rounded-lg"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{name}</span>
                <span className="truncate text-xs">{email}</span>
              </div>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Sparkles />
              <Link
                to="/doctor/dashboard"
                className="text-sm text-gray-700 hover:text-indigo-600 px-2 py-1 rounded"
              >
                Dashboard
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuItem>
              <BadgeCheck />
              <Link
                to="/my_space"
                className="text-sm text-gray-700 hover:text-indigo-600 px-2 py-1 rounded"
              >
                Mes informations
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell />
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={async () => {
              try {
                await logout(); // vide AuthService + AuthContext
                navigate("/"); // redirige home
              } catch (err) {
                console.error("Erreur logout :", err);
              }
            }}
            className="cursor-pointer"
          >
            <LogOut />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
