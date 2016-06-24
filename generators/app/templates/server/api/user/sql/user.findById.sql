/*
Finds the user at @userId
*/

SELECT
    [userId]
  , [name]
  , [email]
  , [customerId]
  , [dateCreated]
  , [dateUpdated]
  , [isDisabled]
FROM [dbo].[User]
WHERE [userId] = @userId
  AND [isDisabled] = 0
