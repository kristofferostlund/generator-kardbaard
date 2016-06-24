/*
Creates a user to db and selects it.
*/

-- Insert the user
INSERT INTO [dbo].[User] (
    [name]
  , [email]
  , [password]
  , [customerId]
)
VALUES (
    @name
  , @email
  , @password
  , @customerId
)

-- Select it
SELECT TOP 1
    [userId]
  , [name]
  , [email]
  , [customerId]
  , [dateCreated]
  , [dateUpdated]
  , [isDisabled]
FROM [dbo].[User]
ORDER BY [userId] DESC
