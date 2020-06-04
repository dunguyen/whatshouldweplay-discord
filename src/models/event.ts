import mongoose, { Model, Schema } from 'mongoose';
import logger from '../util/logger';

export type EventDocument = mongoose.Document & {
    channelId: string;
    channelType: string;
    discordUserId: string;
    commandName: string;
    commandArgs: string[];
    result: boolean;
    event: string;
    eventDetails: any;
};

const EventSchema = new mongoose.Schema(
    {
        channelId: String,
        channelType: String,
        discordUserId: String,
        commandName: String,
        commandArgs: [String],
        result: Boolean,
        event: String,
        eventDetails: Schema.Types.Mixed,
    },
    { timestamps: true }
);

let Event: Model<EventDocument>;

export const getEventModel = (): mongoose.Model<EventDocument, {}> => {
    try {
        Event = mongoose.model<EventDocument>('Event', EventSchema);
    } catch (e) {
        logger.debug(e);
    }
    return Event;
};
