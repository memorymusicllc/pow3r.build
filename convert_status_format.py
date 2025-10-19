#!/usr/bin/env python3
"""
Convert Status Format Script
Converts pow3r.v3.status.json files from legacy to new status format
"""

import json
import sys
from pathlib import Path
from status_utils import normalize_status, create_status_info, convert_legacy_to_new


def convert_config_file(input_file: str, output_file: str = None):
    """Convert a config file from legacy to new status format"""
    
    if output_file is None:
        output_file = input_file
    
    print(f"📖 Reading: {input_file}")
    
    with open(input_file, 'r') as f:
        config = json.load(f)
    
    # Convert repository status
    if 'status' in config:
        legacy_status = config['status']
        if isinstance(legacy_status, str) and legacy_status in ['green', 'orange', 'red', 'gray']:
            new_state = convert_legacy_to_new(legacy_status)
            progress = 100 if legacy_status == 'green' else 50 if legacy_status == 'orange' else 0
            config['status'] = create_status_info(new_state, progress)
            print(f"  ✓ Converted repo status: {legacy_status} → {new_state} ({progress}%)")
    
    # Convert node statuses
    nodes_converted = 0
    if 'nodes' in config:
        for node in config['nodes']:
            if 'status' in node:
                old_status = node['status']
                
                # If it's a legacy string
                if isinstance(old_status, str) and old_status in ['green', 'orange', 'red', 'gray']:
                    new_state = convert_legacy_to_new(old_status)
                    
                    # Try to get progress from quality.completeness if available
                    progress = None
                    if 'quality' in node and 'completeness' in node['quality']:
                        progress = int(node['quality']['completeness'] * 100)
                    
                    quality_score = None
                    notes = None
                    if 'quality' in node:
                        quality_score = node['quality'].get('qualityScore')
                        notes = node['quality'].get('notes')
                    
                    node['status'] = create_status_info(
                        state=new_state,
                        progress=progress,
                        quality_score=quality_score,
                        notes=notes
                    )
                    nodes_converted += 1
    
    print(f"  ✓ Converted {nodes_converted} node statuses")
    
    # Write output
    print(f"💾 Writing: {output_file}")
    with open(output_file, 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"✅ Conversion complete!")
    return config


if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python convert_status_format.py <config_file> [output_file]")
        print("\nExample:")
        print("  python convert_status_format.py pow3r.v3.status.json")
        print("  python convert_status_format.py pow3r.v3.status.json new-config.json")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not Path(input_file).exists():
        print(f"❌ Error: File not found: {input_file}")
        sys.exit(1)
    
    try:
        convert_config_file(input_file, output_file)
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

