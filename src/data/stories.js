// Story View · combined registry. 24 stories across 4 tags (Framework, Use case, Deployment, Flow).

import { STORIES as FRAMEWORK_STORIES, STORY_ORDER as FRAMEWORK_ORDER } from './stories/frameworks.js'
import { STORIES as USECASE_STORIES,   STORY_ORDER as USECASE_ORDER }   from './stories/usecases.js'
import { STORIES as DEPLOY_STORIES,    STORY_ORDER as DEPLOY_ORDER }    from './stories/deployments.js'
import { STORIES as FLOW_STORIES,      STORY_ORDER as FLOW_ORDER }      from './stories/flows.js'
import { STORIES as COMPLIANCE_STORIES, STORY_ORDER as COMPLIANCE_ORDER } from './stories/compliance-focus.js'
import { STORIES as COPILOT_STORIES,    STORY_ORDER as COPILOT_ORDER }    from './stories/copilot-security.js'

export const STORIES = {
  ...FRAMEWORK_STORIES,
  ...USECASE_STORIES,
  ...DEPLOY_STORIES,
  ...FLOW_STORIES,
  ...COMPLIANCE_STORIES,
  ...COPILOT_STORIES
}

export const STORY_ORDER = [
  ...FRAMEWORK_ORDER,
  ...USECASE_ORDER,
  ...DEPLOY_ORDER,
  ...FLOW_ORDER,
  ...COMPLIANCE_ORDER,
  ...COPILOT_ORDER
]
