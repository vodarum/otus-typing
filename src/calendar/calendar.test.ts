import * as UUID from "uuid";

import Calendar from "./calendar";
import { EventStatus, EventTag, MyEvent } from "./types";

jest.mock("uuid");

const mockData: Array<MyEvent> = [
  {
    id: "3616d7b7-5a3d-42b7-8b9e-e968720d6919",
    name: "Встреча c Заказчиком",
    dateFrom: new Date("2023-01-13 10:00"),
    dateTo: new Date("2023-01-13 11:00"),
    status: EventStatus.completed,
    tag: EventTag.meeting,
  },
  {
    id: "a462a260-9f38-4bb3-8661-07ba4c34a1bb",
    name: "День рождения шефа",
    dateFrom: new Date("2023-01-25 09:00"),
    dateTo: new Date("2023-01-25 10:00"),
    status: EventStatus.scheduled,
    tag: EventTag.birthday,
  },
  {
    id: "adcf4421-8c53-40fe-8a28-0e637bb23962b",
    name: "Отвезти кошку к ветеринару",
    dateFrom: new Date("2023-01-15 13:00"),
    dateTo: new Date("2023-01-15 15:00"),
    status: EventStatus.canceled,
    tag: EventTag.task,
  },
];

const setCalendarStorage = () => {
  localStorage.setItem(
    "calendar",
    JSON.stringify(mockData.map((evt: MyEvent) => [evt.id, evt]))
  );
};

describe("Calendar", () => {
  let calendar: Calendar;

  beforeAll(() => {
    calendar = new Calendar();
  });

  afterAll(() => {
    localStorage.removeItem("calendar");
  });

  describe("public interface", () => {
    it("is a class", () => {
      expect(Calendar).toBeInstanceOf(Function);
      expect(calendar).toBeInstanceOf(Calendar);
    });

    it("has public methods", () => {
      expect(calendar.addEvent).toBeInstanceOf(Function);
      expect(calendar.updateEvent).toBeInstanceOf(Function);
      expect(calendar.getEvent).toBeInstanceOf(Function);
      expect(calendar.deleteEvent).toBeInstanceOf(Function);
      expect(calendar.filterEvent).toBeInstanceOf(Function);
    });
  });

  describe("functional interface", () => {
    describe.each(mockData)("adds new event in calendar", (evt: MyEvent) => {
      const spyUUIDv4 = jest.spyOn(UUID, "v4");

      beforeEach(() => {
        spyUUIDv4.mockReturnValueOnce(evt.id);
      });

      it("", async () => {
        const newEventID = await calendar.addEvent({
          name: evt.name,
          dateFrom: evt.dateFrom,
          dateTo: evt.dateTo,
          status: evt.status,
          tag: evt.tag,
        });

        expect(spyUUIDv4).toBeCalledTimes(1);
        expect(newEventID).toBe(evt.id);
      });
    });

    describe("updates calendar event if it exists", () => {
      const spyConsoleError = jest.spyOn(console, "error");

      beforeAll(() => {
        setCalendarStorage();
      });

      it.each([
        ...mockData,
        {
          id: "00000000-0000-0000-0000-000000000000",
          name: "Wrong Event",
          dateFrom: new Date(),
          dateTo: new Date(),
          status: EventStatus.canceled,
          tag: EventTag.task,
        },
      ])("", async (evt: MyEvent) => {
        const now = new Date();
        const newDateFrom = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          15
        );
        const newDateTo = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          17
        );

        const changes = {
          name: `${evt.name} New Event`,
          dateFrom: newDateFrom,
          dateTo: newDateTo,
          status: evt.status,
          tag: evt.tag,
        };

        const affectedEvent = await calendar.updateEvent(evt.id, changes);

        if (evt.id === "00000000-0000-0000-0000-000000000000") {
          expect(affectedEvent).toBe(0);
          expect(spyConsoleError).toBeCalledWith(
            `Error in Calendar.updateEvent: Event with id ${evt.id} not found`
          );
        } else {
          expect(affectedEvent).toBe(1);

          const updatedEvent = await calendar.getEvent(evt.id);
          expect(updatedEvent).toEqual(Object.assign(changes, { id: evt.id }));
        }
      });
    });

    describe("gets calendar event if it exists", () => {
      beforeAll(() => {
        setCalendarStorage();
      });

      it.each([
        ...mockData,
        {
          id: "00000000-0000-0000-0000-000000000000",
          name: "Wrong Event",
          dateFrom: new Date(),
          dateTo: new Date(),
          status: EventStatus.canceled,
          tag: EventTag.task,
        },
      ])("", async (evt: MyEvent) => {
        const eventByID = await calendar.getEvent(evt.id);

        if (evt.id === "00000000-0000-0000-0000-000000000000") {
          expect(eventByID).toBeNull();
        } else {
          expect(eventByID).toEqual(evt);
        }
      });
    });

    describe("deletes calendar event if it exists", () => {
      beforeAll(() => {
        setCalendarStorage();
      });

      it.each([
        ...mockData,
        {
          id: "00000000-0000-0000-0000-000000000000",
          name: "Wrong Event",
          dateFrom: new Date(),
          dateTo: new Date(),
          status: EventStatus.canceled,
          tag: EventTag.task,
        },
      ])("", async (evt: MyEvent) => {
        const affectedEvent = await calendar.deleteEvent(evt.id);

        if (evt.id === "00000000-0000-0000-0000-000000000000") {
          expect(affectedEvent).toBe(0);
        } else {
          expect(affectedEvent).toBe(1);
        }

        const eventByID = await calendar.getEvent(evt.id);
        expect(eventByID).toBeNull();
      });
    });

    describe("filters calendar events", () => {
      beforeAll(() => {
        setCalendarStorage();
      });

      it("by text", async () => {
        const filteredEvents = await calendar.filterEvent({
          text: "рожден",
        });

        expect(filteredEvents).toEqual([mockData[1]]);
      });

      it("by text", async () => {
        const filteredEvents = await calendar.filterEvent({
          text: "ко",
        });

        expect(filteredEvents).toEqual([mockData[0], mockData[2]]);
      });

      it("by text and dateFrom", async () => {
        const filteredEvents = await calendar.filterEvent({
          text: "ко",
          dateFrom: new Date("2023-01-15 13:00"),
        });

        expect(filteredEvents).toEqual([mockData[2]]);
      });

      it("by dateFrom", async () => {
        const filteredEvents = await calendar.filterEvent({
          dateFrom: new Date("2023-01-15"),
        });

        expect(filteredEvents).toEqual([mockData[1], mockData[2]]);
      });

      it("by dateTo without time", async () => {
        const filteredEvents = await calendar.filterEvent({
          dateTo: new Date("2023-01-25"),
        });

        expect(filteredEvents).toEqual([mockData[0], mockData[2]]);
      });

      it("by dateTo with time", async () => {
        const filteredEvents = await calendar.filterEvent({
          dateTo: new Date("2023-01-25 18:00"),
        });

        expect(filteredEvents).toEqual(mockData);
      });

      it("by dateFrom and dateTo", async () => {
        const filteredEvents = await calendar.filterEvent({
          dateFrom: new Date("2023-01-15 13:00"),
          dateTo: new Date("2023-01-15 14:00"),
        });

        expect(filteredEvents.length).toBe(0);
      });

      it("by status", async () => {
        const filteredEvents = await calendar.filterEvent({
          status: EventStatus.scheduled,
        });

        expect(filteredEvents).toEqual([mockData[1]]);
      });

      it("by tag", async () => {
        const filteredEvents = await calendar.filterEvent({
          tag: EventTag.meeting,
        });

        expect(filteredEvents).toEqual([mockData[0]]);
      });

      it("by status and tag", async () => {
        const filteredEvents = await calendar.filterEvent({
          status: EventStatus.scheduled,
          tag: EventTag.meeting,
        });

        expect(filteredEvents.length).toBe(0);
      });

      it("by full criteria without match by dateTo", async () => {
        const filteredEvents = await calendar.filterEvent({
          text: "ко",
          dateFrom: new Date("2023-01-15"),
          dateTo: new Date("2023-01-15"),
          status: EventStatus.canceled,
          tag: EventTag.task,
        });

        expect(filteredEvents.length).toBe(0);
      });

      it("by full criteria", async () => {
        const filteredEvents = await calendar.filterEvent({
          text: "ко",
          dateFrom: new Date("2023-01-15"),
          dateTo: new Date("2023-01-15 15:00"),
          status: EventStatus.canceled,
          tag: EventTag.task,
        });

        expect(filteredEvents).toEqual([mockData[2]]);
      });
    });
  });
});
