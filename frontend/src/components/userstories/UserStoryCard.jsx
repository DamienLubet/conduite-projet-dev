export default function UserStoryCard({ 
    story, 
    onEdit
}) {

    return (
        <div>
            <div className="userstory-card" onClick={() => onEdit(story)}>
                
                <div className="userstory-card-header">
                    <div className="userstory-card-header-left">
                        <span className="userstory-number">US{story.number}</span>
                        <span className="userstory-title">{story.title}</span>
                    </div>
                    
                    <span className={`userstory-priority userstory-priority-${story.priority.toLowerCase()}`}>{story.priority}</span>
                    <span className="userstory-storypoints">{story.storyPoints} SP</span>
                </div>
                
                {story.description && (<p className="userstory-description">{story.description}</p>)}
                
                <div className="userstory-card-footer">
                    <button className='create-task-button'>New Task</button>
                </div>
            </div>
        </div>
    );
}