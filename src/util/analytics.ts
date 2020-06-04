import { getEventModel, AnalyticsEvent } from '../models/event';

const EventModel = getEventModel();

export const logEvent = function (event: AnalyticsEvent): void {
    EventModel.insertMany(event);
};
