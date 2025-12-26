import mongoose from "mongoose";

const transcriptSchema = new mongoose.Schema({
  fileName: String,
  status: { type: String, default: "pending" },
  text: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});


export default mongoose.model("Transcript", transcriptSchema);
