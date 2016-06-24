/*
Updates a <%= name %> to db and selects it.
*/

-- Update the <%= name %>
UPDATE [dbo].[<%= nameCapitalized %>]
SET
    [description] = @description
  , [dateUpdated] = GETUTCDATE()
WHERE [<%= name %>Id] = @<%= name %>Id

-- Select it
SELECT
    [<%= name %>Id]
  , [description]
  , [dateCreated]
  , [dateUpdated]
  , [isDisabled]
FROM [dbo].[<%= nameCapitalized %>]
WHERE [<%= name %>Id] = @<%= name %>Id
