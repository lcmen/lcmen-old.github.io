---
layout: default
title: Removing event from fullcalendar with React by dragging out
date: 2021-10-04
parent: React
---

# Removing event from fullcalendar with React by dragging out

Recently, I've been tasked with adding CRUD like interaction to [fullcalendar](https://fullcalendar.io){:target="_blank"} component with [react](https://fullcalendar.io/docs/react){:target="_blank"}.

Despite `@fullcalendar/interaction` plugin providing most of the functionality out of the box, it still misses a drag-out event but it is powerful enough to provide primitives for custom implementation.

Let's see it in the wild by kicking off the tires with our component's scaffold:

```typescript
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { EventDragStopArg } from "@fullcalendar/interaction";
import { DateSelectArg } from "@fullcalendar/core";

export default function App() {
  const add = ({ start, end, view: { calendar } }: DateSelectArg): void => {
    calendar.addEvent({ start, end });
  };
  const remove = ({ event, jsEvent, view: { calendar } }: EventDragStopArg): void => {
    console.log("Remove me");
  };

  return (
    <div>
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        allDaySlot={false}
        initialView="timeGridWeek"
        dragRevertDuration={0}
        headerToolbar={false}
        editable={true}
        eventDragStop={remove}
        eventOverlap={false}
        select={add}
        selectable={true}
        selectOverlap={false}
        themeSystem="bootstrap"
      />
    </div>
  );
}
```

This code creates `FullCalendar` component with a time-week grid supporting new events upon selection. It also prevents overlapping on resizing and drag & drop (`dragRevertDuration` set to 0, eliminates ghost-like effect when an event is dragged to invalid spot).

To implement our `remove` handler, we need to look at `EventDragStopArg` signature first:

```typescript
interface EventDragStopArg {
  el: HTMLElement
  event: EventApi
  jsEvent: MouseEvent
  view: ViewApi
} 
```

By having access to `MouseEvent` object, we can calculate if the event's `pageX` and `pageY` coordinates (where the dragging stops) are within of calendar's boundaries. This will allow us to detect whether an event has been dragged out of the calendar.

To get calendar boundaries we first need to get a `ref` of parent `div`:

```typescript
import { useRef } from 'react';

...

export default function App() {
  const container = useRef(null);

  return (
    <div ref={container}>
      ...
    </div>
  );
}
```

Once we have access to the container, we can start implementing our `remove` function:

```typescript
if (!container.current) return;
if (inElement({ x: jsEvent.pageX, y: jsEvent.pageY }, container.current!)) return;
event.remove();
```

Now, we need to write `inElement` function to check if `{x,y}` are within the element's boundaries:

```typescript
function inElement(point: { x: number, y: number }, element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  const bottom = rect.bottom + window.scrollY;
  const left = rect.left + window.scrollX;
  const right = rect.right + window.scrollX;

  return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
}
```

With all changes in place, our final code looks as follows:

```typescript
import { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { EventDragStopArg } from "@fullcalendar/interaction";
import { DateSelectArg } from "@fullcalendar/core";

export default function App() {
  const container = useRef(null);
  const add = ({ start, end, view: { calendar } }: DateSelectArg): void => {
    calendar.addEvent({ start, end });
  };
  const remove = ({ event, jsEvent, view: { calendar } }: EventDragStopArg): void => {
    if (!container.current) return;
    if (inElement({ x: jsEvent.pageX, y: jsEvent.pageY }, container.current!)) return;

    event.remove();
  };

  return (
    <div ref={container}>
      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        allDaySlot={false}
        dragRevertDuration={0}
        initialView="timeGridWeek"
        headerToolbar={false}
        editable={true}
        eventOverlap={false}
        eventDragStop={remove}
        select={add}
        selectable={true}
        selectOverlap={false}
        themeSystem="bootstrap"
      />
    </div>
  );
}

function inElement(point: { x: number; y: number }, element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  const top = rect.top + window.scrollY;
  const bottom = rect.bottom + window.scrollY;
  const left = rect.left + window.scrollX;
  const right = rect.right + window.scrollX;

  return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
}
```

You can see a working demo on [CodeSandbox](https://codesandbox.io/s/hopeful-ritchie-dl3on?file=/src/App.tsx){:target="_blank"}.
