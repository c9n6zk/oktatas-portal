"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

type Assignment = {
  id: string;
  year: number;
  subjectName: string;
  subjectCode: string;
  teacherName: string;
};

export function StudentAttendancePanel({ assignments }: { assignments: Assignment[] }) {
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{
    subject: string;
    lat: number;
    lng: number;
    at: Date;
  } | null>(null);

  async function handleCheckIn(a: Assignment) {
    if (!("geolocation" in navigator)) {
      toast.error("A böngésződ nem támogatja a helymeghatározást");
      return;
    }
    setSubmittingId(a.id);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch("/api/attendance", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              assignmentId: a.id,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              source: "gps",
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            toast.error(err.error ?? "Sikertelen bejelentkezés");
            return;
          }
          const data = await res.json();
          setLastResult({
            subject: data.subject,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            at: new Date(),
          });
          toast.success(`✓ Bejelentkeztél: ${data.subject}`);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Hiba");
        } finally {
          setSubmittingId(null);
        }
      },
      (err) => {
        setSubmittingId(null);
        toast.error(
          err.code === err.PERMISSION_DENIED
            ? "Helymeghatározás engedély megtagadva"
            : err.message,
        );
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  return (
    <div className="space-y-4">
      {lastResult && (
        <Card className="border-green-500/40 bg-green-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <MapPin className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <div className="font-medium">✓ Bejelentkeztél: {lastResult.subject}</div>
              <div className="text-muted-foreground text-xs mt-1 tabular-nums">
                {lastResult.lat.toFixed(5)}, {lastResult.lng.toFixed(5)} ·{" "}
                {lastResult.at.toLocaleTimeString("hu-HU")}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {assignments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nincs hozzád rendelt tárgy.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {assignments.map((a) => (
            <Card key={a.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{a.subjectName}</CardTitle>
                    <CardDescription className="text-xs">
                      {a.subjectCode} · {a.teacherName}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{a.year}/{a.year + 1}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleCheckIn(a)}
                  disabled={submittingId !== null}
                  className="w-full"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {submittingId === a.id ? "Helymeghatározás…" : "📍 Itt vagyok"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
