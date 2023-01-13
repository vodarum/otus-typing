import { v4 as UUIDv4 } from "uuid";
import { AffectedEvent, EventUUID, MyEvent, FilteringObject } from "./types";

interface ICalendar {
  addEvent: (event: Omit<MyEvent, "id">) => Promise<EventUUID | null>;
  updateEvent: (
    id: EventUUID,
    changes: Partial<Omit<MyEvent, "id">>
  ) => Promise<AffectedEvent>;
  getEvent: (id: EventUUID) => Promise<MyEvent | null>;
  deleteEvent: (id: EventUUID) => Promise<AffectedEvent>;
  filterEvent: (criteria: Partial<FilteringObject>) => Promise<Array<MyEvent>>;
}

export default class Calendar implements ICalendar {
  async addEvent(event: Omit<MyEvent, "id">): Promise<EventUUID | null> {
    try {
      const newEvent = Object.assign(event, { id: UUIDv4() });
      const calendarStorage: Map<EventUUID, MyEvent> =
        await this.getCalendarStorage();

      calendarStorage.set(newEvent.id, newEvent);

      if (
        JSON.stringify(calendarStorage.get(newEvent.id)) ===
        JSON.stringify(newEvent)
      ) {
        await this.saveCalendarStorage(calendarStorage);

        return newEvent.id;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error in Calendar.addEvent: ${error.message}`);
      }
    }

    return null;
  }

  async updateEvent(
    id: EventUUID,
    changes: Partial<Omit<MyEvent, "id">>
  ): Promise<AffectedEvent> {
    try {
      const calendarStorage: Map<EventUUID, MyEvent> =
        await this.getCalendarStorage();
      const eventById = calendarStorage.get(id);

      if (!eventById) {
        throw new Error(`Event with id ${id} not found`);
      }

      const modifiedEvent = Object.assign(eventById, changes);

      calendarStorage.set(id, modifiedEvent);

      if (
        JSON.stringify(calendarStorage.get(id)) ===
        JSON.stringify(modifiedEvent)
      ) {
        await this.saveCalendarStorage(calendarStorage);

        return 1;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error in Calendar.updateEvent: ${error.message}`);
      }
    }

    return 0;
  }

  async getEvent(id: EventUUID): Promise<MyEvent | null> {
    try {
      const calendarStorage: Map<EventUUID, MyEvent> =
        await this.getCalendarStorage();

      return calendarStorage.get(id) ?? null;
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error in Calendar.getEvent: ${error.message}`);
      }
    }

    return null;
  }

  async deleteEvent(id: EventUUID): Promise<AffectedEvent> {
    try {
      const calendarStorage: Map<EventUUID, MyEvent> =
        await this.getCalendarStorage();

      if (calendarStorage.delete(id)) {
        await this.saveCalendarStorage(calendarStorage);

        return 1;
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error in Calendar.deleteEvent: ${error.message}`);
      }
    }

    return 0;
  }

  async filterEvent(
    criteria: Partial<FilteringObject>
  ): Promise<Array<MyEvent>> {
    const result: Array<MyEvent> = [];

    try {
      const calendarStorage: Map<EventUUID, MyEvent> =
        await this.getCalendarStorage();

      /* eslint-disable-next-line */
      for (const event of calendarStorage.values()) {
        if (
          criteria.text &&
          !event.name.toLowerCase().includes(criteria.text.toLowerCase())
        ) {
          continue;
        }

        if (criteria.dateFrom && criteria.dateFrom > event.dateFrom) {
          continue;
        }

        if (criteria.dateTo && criteria.dateTo < event.dateTo) {
          continue;
        }

        if (criteria.status && criteria.status !== event.status) {
          continue;
        }

        if (criteria.tag && criteria.tag !== event.tag) {
          continue;
        }

        result.push(event);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error in Calendar.filterEvent: ${error.message}`);
      }
    }

    return result;
  }

  /* eslint class-methods-use-this: ["error", { "exceptMethods": ["getCalendarStorage", "saveCalendarStorage"] }] */
  private async getCalendarStorage(): Promise<Map<EventUUID, MyEvent>> {
    let result: Map<EventUUID, MyEvent> = new Map();

    try {
      const calendarStorageJSON = localStorage.getItem("calendar");

      if (calendarStorageJSON !== null) {
        result = JSON.parse(calendarStorageJSON) ?? result;
      }
    } catch (error) {
      throw new Error("Error getting CalendarStorage");
    }

    return result;
  }

  private async saveCalendarStorage(
    data: Map<EventUUID, MyEvent>
  ): Promise<void> {
    try {
      localStorage.setItem("calendar", JSON.stringify(data));
    } catch (error) {
      throw new Error("Error saving CalendarStorage");
    }
  }
}
