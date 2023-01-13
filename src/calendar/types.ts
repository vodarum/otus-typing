enum EventStatus {
  scheduled = "Scheduled",
  inProcess = "In Process",
  completed = "Completed",
  canceled = "Canceled",
}

enum EventTag {
  birthday = "Birthday",
  meeting = "Meeting",
  task = "Task",
}

type AffectedEvent = 0 | 1;

type EventUUID = string;

type MyEvent = {
  id: EventUUID;
  name: string;
  dateFrom: Date;
  dateTo: Date;
  status: EventStatus;
  tag: EventTag;
};

type FilteringObject = {
  text: string;
  dateFrom: Date;
  dateTo: Date;
  status: EventStatus;
  tag: EventTag;
};

export {
  EventStatus,
  EventTag,
  AffectedEvent,
  EventUUID,
  MyEvent,
  FilteringObject,
};
