/*
Disables the user at @userId
*/

UPDATE [dbo].[User]
SET
    [isDisabled] = 1
  , [dateUpdated] = GETUTCDATE()
WHERE [userId] = @userId