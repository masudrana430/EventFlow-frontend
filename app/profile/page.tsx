"use client";
import {useEffect,useState} from "react";
import {getMe} from "@/lib/auth";
import type {AuthUser} from "@/types";
export default function Profile(){const [user,setUser]=useState<AuthUser|null>(null);const [error,setError]=useState("");useEffect(()=>{getMe().then(r=>setUser(r.data)).catch(err=>setError(err?.response?.data?.message||"Could not load profile"))},[]);return <main className="container-page py-12"><div className="card max-w-2xl"><h1 className="text-3xl font-bold">Profile</h1>{error&&<p className="mt-4 text-red-600">{error}</p>}{user&&<div className="mt-6 space-y-2"><p><b>Name:</b> {user.name}</p><p><b>Email:</b> {user.email}</p><p><b>Role:</b> {user.role}</p></div>}</div></main>}
