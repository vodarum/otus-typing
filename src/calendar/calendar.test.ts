import * as UUID from "uuid";

import Calendar from "./calendar";
import { EventStatus, EventTag, MyEvent } from "./types";

jest.mock("uuid");

const testData: Array<MyEvent> = [
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

describe("Calendar", () => {
  let calendar: Calendar;

  beforeAll(() => {
    calendar = new Calendar();
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
    describe.each(testData)("adds new event in calendar", (evt: MyEvent) => {
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
  });
});
