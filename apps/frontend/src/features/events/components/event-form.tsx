'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { EventFormValues } from '../event-form.types';

interface EventFormProps {
  mode: 'create' | 'edit';
  title: string;
  description?: string;
  values: EventFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage?: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function EventForm({
  mode,
  title,
  description,
  values,
  submitLabel,
  isSubmitting,
  errorMessage,
  onChange,
  onSubmit,
}: EventFormProps) {
  const modeLabel = mode === 'create' ? 'Create flow' : 'Edit flow';
  const pendingLabel = mode === 'create' ? 'Creating...' : 'Saving...';

  return (
    <Card className="border-border bg-surface">
      <CardHeader className="space-y-3 border-border">
        <Badge variant="slate" className="w-fit">
          {modeLabel}
        </Badge>
        <CardTitle className="text-2xl text-text">{title}</CardTitle>
        {description ? (
          <p className="max-w-2xl text-sm leading-6 text-text-muted">
            {description}
          </p>
        ) : null}
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-text">
              Event title
            </label>
            <Input
              id="title"
              name="title"
              value={values.title}
              onChange={onChange}
              placeholder="Product meetup"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium text-text"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={values.description}
              onChange={onChange}
              rows={5}
              required
              className="flex w-full rounded-lg border border-border bg-surface px-3.5 py-3 text-sm text-text placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
              placeholder="What should attendees know before joining?"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium text-text">
              Location
            </label>
            <Input
              id="location"
              name="location"
              value={values.location}
              onChange={onChange}
              placeholder="Hall A or Online"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="startDate"
                className="text-sm font-medium text-text"
              >
                Start date and time
              </label>
              <Input
                id="startDate"
                name="startDate"
                type="datetime-local"
                value={values.startDate}
                onChange={onChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="endDate"
                className="text-sm font-medium text-text"
              >
                End date and time
              </label>
              <Input
                id="endDate"
                name="endDate"
                type="datetime-local"
                value={values.endDate}
                onChange={onChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="capacity" className="text-sm font-medium text-text">
              Capacity
            </label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              value={values.capacity}
              onChange={onChange}
              required
            />
          </div>

          {errorMessage ? (
            <div className="rounded-lg border border-[#EDC0B6] bg-destructive-muted px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex justify-end border-t border-border pt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? pendingLabel : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
