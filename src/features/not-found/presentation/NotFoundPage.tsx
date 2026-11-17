import {Link} from 'react-router-dom'
import {Card,PageHeader} from '../../../components/ui'
export function NotFoundPage(){return <><PageHeader eyebrow="404 / NOT FOUND" title="This route has no subnet." description="The page may have moved or the address may be incorrect."/><Card className="not-found"><p>Return to the dashboard and choose a tool from the navigation.</p><Link className="btn btn-primary" to="/">Back to dashboard</Link></Card></>}
