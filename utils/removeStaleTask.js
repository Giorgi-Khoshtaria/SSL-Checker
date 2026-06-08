import { findTask } from "./finedTask.js";
import { deleteTask } from "./deleteTask.js";

export const removeStaleTask = async (website) => {
  const task = await findTask(website, { includeClosed: true });
  if (task) {
    await deleteTask(task.id);
    console.log(`🗑️  Removed task for ${website} (cert renewed)`);
  }
};
