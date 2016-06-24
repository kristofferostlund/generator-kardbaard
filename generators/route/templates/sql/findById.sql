/*
Finds the <%= name %> at @<%= name %>Id
*/

SELECT
    [<%= name %>Id]
  , [description]
  , [dateCreated]
  , [dateUpdated]
  , [isDisabled]
FROM [dbo].[<%= nameCapitalized %>]
WHERE [<%= name %>Id] = @<%= name %>Id
  AND [isDisabled] = 0
