import mongoose, { Model, Schema } from 'mongoose';
import logger from '../util/logger';

export type AnalyticsEvent = {
    channelId: string;
    channelType: string;
    discordUserId: string;
    commandName: string;
    commandArgs: number;
    result?: boolean;
    event: string;
    eventDetails?: unknown;
};

export type EventDocument = mongoose.Document & AnalyticsEvent;

const EventSchema = new mongoose.Schema(
    {
        channelId: String,
        channelType: String,
        discordUserId: String,
        commandName: String,
        commandArgs: Number,
        result: { type: Boolean, default: 'false' },
        event: String,
        eventDetails: Schema.Types.Mixed,
    },
    { timestamps: true }
);

let Event: Model<EventDocument>;

export const getEventModel = (): mongoose.Model<EventDocument> => {
    try {
        Event = mongoose.model<EventDocument>('Event', EventSchema);
    } catch (e) {
        logger.debug(e);
    }
    return Event;
};
