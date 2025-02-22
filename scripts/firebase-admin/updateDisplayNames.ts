import { Script } from "./types"

export const script: Script = async ({ db }) => {
  const writer = db.bulkWriter()
  const users = await db
    .collection("profiles")
    .where("role", "in", ["user", "admin"])
    .get()
  console.log(`updating ${users.size} documents`)
  for (const user of users.docs) {
    try {
      const data = user.data()
      console.log(data)
      const pTestimonies = db
        .collection(`users/${user.id}/publishedTestimony`)
        .get()
        .then(result => result.docs)

      const dTestimonies = db
        .collection(`users/${user.id}/publishedTestimony`)
        .get()
        .then(result => result.docs)

      const [publishedTestimony, draftTestimony] = await Promise.all([
        pTestimonies,
        dTestimonies
      ])

      const fullName = data.fullName ?? "Anonymous"
      const displayName = data.public ? fullName : "<private user>"

      for (const doc of publishedTestimony) {
        writer.update(doc.ref, {
          authorDisplayName: displayName,
          fullName: fullName
        })
      }
      for (const doc of draftTestimony) {
        writer.update(doc.ref, {
          authorDisplayName: displayName,
          fullName: fullName
        })
      }
    } catch (error) {
      // Log the error and continue with the next user
      console.error(`Error updating email for user ${user.data().id}: `, error)
    }
  }

  await writer.close()
  console.log(`updated ${users.size} documents`)
}
