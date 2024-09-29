const axios = require('axios');
const cron = require('node-cron');


module.exports = function(api) {
  if (global.heru.autopost === true) {
    cron.schedule(
      "0 */5 * * *",
      async function () {
        console.log("cron");
        const getfact = (await axios.get("https://catfact.ninja/fact")).data;
        const fact = getfact.fact;
        let uuid = getGUID();

        // Getting admin's uid
        const adminUID = global.heru.admin[0]; // Ensure the admin uid is set

        const formData = {
          input: {
            composer_entry_point: "inline_composer",
            composer_source_surface: "timeline",
            idempotence_token: uuid + "_FEED",
            source: "WWW",
            attachments: [],
            audience: {
              privacy: {
                allow: [],
                base_state: "EVERYONE", // SELF EVERYONE FRIENDS
                deny: [],
                tag_expansion_state: "UNSPECIFIED",
              },
            },
            message: {
              ranges: [], // You can use this to mention someone
              text: "🔖 𝗔𝗨𝗧𝗢𝗣𝗢𝗦𝗧\n\n𝚁𝙰𝙽𝙳𝙾𝙼 𝙲𝙰𝚃 𝙵𝙰𝙲𝚃: “" + fact + "”",
            },
            inline_activities: [],
            explicit_place_id: "0",
            text_format_preset_id: "0",
            logging: {
              composer_session_id: uuid,
            },
            tracking: [null],
            actor_id: api.getCurrentUserID(),
            client_mutation_id: Math.floor(Math.random() * 17),
          },
          displayCommentsFeedbackContext: null,
          displayCommentsContextEnableComment: null,
          displayCommentsContextIsAdPreview: null,
          displayCommentsContextIsAggregatedShare: null,
          displayCommentsContextIsStorySet: null,
          feedLocation: "TIMELINE",
          feedbackSource: 0,
          focusCommentID: null,
          gridMediaWidth: 230,
          groupID: null,
          scale: 3,
          privacySelectorRenderLocation: "COMET_STREAM",
          renderLocation: "timeline",
          useDefaultActor: false,
          inviteShortLinkKey: null,
          isFeed: false,
          isFundraiser: false,
          isFunFactPost: false,
          isGroup: false,
          isTimeline: true,
          isSocialLearning: false,
          isPageNewsFeed: false,
          isProfileReviews: false,
          isWorkSharedDraft: false,
          UFI2CommentsProvider_commentsKey: "ProfileCometTimelineRoute",
          hashtag: null,
          canUserManageOffers: false,
        };

        const form = {
          av: api.getCurrentUserID(),
          fb_api_req_friendly_name: "ComposerStoryCreateMutation",
          fb_api_caller_class: "RelayModern",
          doc_id: "7711610262190099",
          variables: JSON.stringify(formData),
        };

        // Send the post
        api.httpPost(
          "https://www.facebook.com/api/graphql/",
          form,
          (e, info) => {
            try {
              if (e) throw e;
              if (info.error) throw info.error;
              if (typeof info == "string")
                info = JSON.parse(info.replace("for (;;);", ""));
              const postID =
                info.data.story_create.story.legacy_story_hideable_id;
              if (!postID) throw info.errors;

              // Mention the admin in the message
              const mentionMessage = {
                body: `[AUTO POST]\nLink: https://www.facebook.com/${api.getCurrentUserID()}/posts/${postID}`,
                mentions: [{
                  tag: global.deku.admin[0],
                  id: adminUID // Use the admin's UID here
                }]
              };

              api.sendMessage(mentionMessage, adminUID);

              return console.log(mentionMessage.body);
            } catch (e) {
              return;
            }
          }
        );
      },
      {
        scheduled: true,
        timezone: "Asia/Manila",
      }
    );
  }
};
