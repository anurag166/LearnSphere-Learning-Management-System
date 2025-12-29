import mongoose,{Schema} from 'mongoose'
import { subSection } from './subSection.model'

const SectionSchema = new Schema({
    sectionName: {
        type: String
    },
    subSection: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subSection",
            required: true
        }
    ]
})

export const Section= mongoose.model(Section,"SectionSchema")