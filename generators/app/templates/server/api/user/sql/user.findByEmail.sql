/*
Finds the user at @email
*/

SELECT
    [userId]
  , [name]
  , [email]
  , [password]
  , [customerId]
  , [dateCreated]
  , [dateUpdated]
  , [isDisabled]
FROM [dbo].[User]
WHERE [email] = @email
  AND [isDisabled] = 0
